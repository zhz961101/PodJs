const fs = require('fs');

const warp = (name) => {
  let normalizeName = name.replace(/-(\w)/g, (_, m1) =>
    (m1 || '').toUpperCase(),
  );
  normalizeName = [
    ...normalizeName[0].toUpperCase(),
    ...normalizeName.slice(1),
  ].join('');
  return `
interface ${normalizeName}Props {
  todo: unknown
}

export const ${normalizeName}: MetaComponent<${normalizeName}Props> = props =>
  createVNode(
      'fluent-${name}',
      { ...props, is: 'fluent-${name}' },
      props.children,
  );
`;
};

fs.writeFileSync('./FluentDesign.ts', `// AUTO-GENERATED ${new Date().toUTCString()}
import {MetaComponent, createVNode} from '../../types'
${["breadcrumb-item",
"design-system-provider",
"progress",
"slider",
"tabs",
"accordion",
"button",
"dialog",
"listbox",
"radio",
"slider-label",
"text-area",
"anchor",
"card",
"divider",
"listbox-option",
"radio-group",
"text-field",
"badge",
"checkbox",
"flipper",
"menu",
"select",
"styles",
"tree-item",
"breadcrumb",
"menu-item",
"skeleton",
"switch",
"tree-view",
].map(warp).join('')}`)

console.log('### SUCCESS ###')