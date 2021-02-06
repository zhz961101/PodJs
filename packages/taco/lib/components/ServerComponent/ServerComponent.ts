import { useErrThrower, useInstance, useWatch } from '../../hook';
import {
    createComponentNode,
    AsyncFunctionComponent,
    SyncFunctionComponent,
    VNode,
} from '../../types';

interface ServerVNode {
    type: string;
    props?: object;
    children?: ServerVNode[];
    content?: string;
}

type NodeMap = Record<string, ServerVNode>;

const EMPTYVNode = (): ServerVNode => ({
    type: '#text',
    content: '',
});

const snode2vnode = (snode: ServerVNode, nodeMap: NodeMap): VNode => {
    if (!snode) return EMPTYVNode() as VNode;
    const kind = snode.type.slice(0, 1);
    if (kind === '$') {
        // ServerVNode
        const vnode = createComponentNode(() =>
            snode2vnode(nodeMap[snode.type.slice(1)], nodeMap),
        );
        vnode.props = snode.props;
        vnode.children = snode.children.map(snode =>
            snode2vnode(snode, nodeMap),
        );
        return vnode;
    }
    if (kind === '@') {
        // props
        return snode.props[snode.type.replace('@props.', '')] as VNode;
    }
    return snode as VNode;
};

const escapeEOF = (text: string) =>
    text.replace(/(\\<\\E\\O\\F\\>)/g, (_, m1) => '<EOF>');

const safeJSONParse = (
    maybeJSON: string,
    fallback = {} as object,
    onError?: (err: Error) => void,
) => {
    try {
        return JSON.parse(maybeJSON);
    } catch (error) {
        onError && onError(error);
        return fallback;
    }
};

const respRegex = /(\w+):({[\s\S]+?})<EOF>/g;
const respLoader = async (resp: Response, onError?: (err: Error) => void) => {
    const text = await resp.text();
    return (Object.entries(
        [...text.matchAll(respRegex)].map(
            ([_, uniqID, vnodeJsonText]) =>
                [
                    `$${uniqID}`,
                    safeJSONParse(
                        escapeEOF(vnodeJsonText),
                        EMPTYVNode(),
                        onError,
                    ) as ServerVNode,
                ] as const,
        ),
    ) as any) as NodeMap;
};

const post = (url: string, payload?: any, onError?: (err: Error) => void) =>
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
    })
        .then(respLoader)
        .catch(onError);

export function ServerComponent<Props, Payload extends object>(
    uri: string,
    pending: true,
    payload?: Payload,
): AsyncFunctionComponent<Props>;
export function ServerComponent<Props, Payload extends object>(
    uri: string,
    pending: false,
    payload?: Payload,
): SyncFunctionComponent<Props>;
export function ServerComponent<Props, Payload extends object>(
    uri: string,
    pending?: boolean,
    payload?: Payload,
) {
    const query = (onError: (err: Error) => void) =>
        post(uri, payload, onError);
    if (pending) {
        return async function* (props) {
            const ins = useInstance();
            const thrower = useErrThrower();
            yield null;
            const nodeMap = await query(err => thrower(err, ins));
            if (!nodeMap) return EMPTYVNode() as VNode;
            const entry = nodeMap['ENTRY'];
            entry.props = { ...entry.props, ...props };
            return snode2vnode(entry, nodeMap).children;
        } as AsyncFunctionComponent<Props>;
    }
    return (props => {
        const ins = useInstance();
        const thrower = useErrThrower();
        useWatch(undefined, () => {
            query(err => thrower(err, ins))
                .then(nodeMap => {
                    if (!nodeMap) return EMPTYVNode() as VNode;
                    const entry = nodeMap['ENTRY'];
                    entry.props = { ...entry.props, ...props };
                    return snode2vnode(entry, nodeMap);
                })
                .then(vnode => {
                    // TODO: 不确定
                    ins.clearChildren();
                    ins.mountChildren(vnode.children);
                });
        });
        return props.children;
    }) as SyncFunctionComponent<Props>;
}
