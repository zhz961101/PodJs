import { onUnmount } from '../core/hox';
import { html } from '../core/html';
import { mount } from '../core/mount';
import { Component } from '../core/types';
import { useRef } from '../core/useRef';

export const Portal: Component = (props = {}, children) => {
    const { contianer = document.body } = props || {};
    const elem = useRef(() => {
        const el = document.createElement('div');
        contianer.appendChild(el);
        return el;
    });
    mount(elem.value, html`${children}`);
    onUnmount(() => {
        contianer.removeChild(elem);
    });
    return null;
};
