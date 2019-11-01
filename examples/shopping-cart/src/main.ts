import App from './components/App';
import ProductList from './components/ProductList';
import ShoppingCart from './components/ShoppingCart';
import { createApp } from '../../../src/poi/poi';
import { __global__ } from '../../../src/mvvm/mvvm';
import { cartState } from './store/cart';
import { productState } from './store/product';

__global__["currency"] = "￥"

const $ = q => document.querySelector(q)

createApp(ProductList).component("product-list")
createApp(ShoppingCart).component("shop-cart")

// Components should be registered before the parent component is mounted 

createApp(App).mount($("#appRoot"))

if (process.env.NODE_ENV !== 'production') {
    // __DEV__
    window["g"] = __global__
    window["vm"] = $("#appRoot").$vm
    window["store"] = { cartState, productState }
}

