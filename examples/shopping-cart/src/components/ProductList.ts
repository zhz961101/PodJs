import { Poi } from '../../../../src/component/create';
import { html } from '../../../../src/tools/html';
import { productState, products } from '../store/product';
import { cart } from '../store/cart';

import productListTpl from "./ProductListTpl.html"

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

