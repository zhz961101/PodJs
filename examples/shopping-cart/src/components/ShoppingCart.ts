import { Poi } from '../../../../src/poi/poi';
import { h } from '../../../../src/tools/html';
import { cartState, cart } from '../store/cart';

import ShoppingCartTpl from "./ShoppingCartTpl.html"

const _template = h(ShoppingCartTpl)

export default class ShoppingCart extends Poi {
    setup() {
        return {
            get checkoutStatus() {
                return cartState.checkoutStatus
            },
            get products() {
                return cart.dispatch("cartProducts")
            },
            get total() {
                return cart.dispatch("cartTotalPrice")
            }
        }
    }
    template(): string {
        return _template
    }
    checkout(products) {
        cart.dispatch("checkout", products)
    }
}

