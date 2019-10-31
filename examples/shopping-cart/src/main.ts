import App from './components/App';
import ProductList from './components/ProductList';
import ShoppingCart from './components/ShoppingCart';
import { createApp } from '../../../src/poi/poi';
import { __global__ } from '../../../src/mvvm/mvvm';

__global__["currency"] = "￥"

const $ = q => document.querySelector(q)

createApp(ProductList).component("product-list")
createApp(ShoppingCart).component("shop-cart")

// Components should be registered before the parent component is mounted 

createApp(App).mount($("#appRoot"))

