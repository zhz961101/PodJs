import { Poi } from '../../../../src/component/create';
import { html } from '../../../../src/html';
import { computed, reactive } from '../../../../src/reactivity/reactivity';
import { productState, cart, products } from '../store/index';

import productListTpl from "./ProductListTpl.html"

window["productState"] = productState

export default class ProductList extends Poi {
    constructor() {
        super("product-list")
    }
    setup() {
        return {
            get products() {
                return productState.all
            }
        }
    }
    template(): string {
        return html`${productListTpl}`
    }
    addProductToCart(product) {
        cart.dispatch("addProductToCart", product)
    }
    created() {
        products.dispatch("getAllProducts")
    }
}

