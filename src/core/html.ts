import htm from 'htm';
import { h } from './h';
import { VNode } from './types';

export const html = htm.bind(h) as HtmlTmp;
type HtmlTmp = (strings: TemplateStringsArray, ...values: any[]) => VNode;
