import App from './components/App';
import ProductList from './components/ProductList';
import ShoppingCart from './components/ShoppingCart';
import { createApp } from '../../../src/taco/taco';
import { __Global__ } from '../../../src/mvvm/mvvm';
import { cartState } from './store/cart';
import { productState } from './store/product';

__Global__["currency"] = "￥"

const $ = q => document.querySelector(q)

createApp(new ProductList()).component("product-list")
createApp(new ShoppingCart()).component("shop-cart")

// Components should be registered before the parent component is mounted 

createApp(new App()).mount($("#appRoot"))

if (process.env.NODE_ENV !== 'production') {
    // __DEV__
    window["g"] = __Global__
    window["vm"] = $("#appRoot").$vm
    window["store"] = { cartState, productState }
}

