import App from './components/App';
import ProductList from './components/ProductList';
import ShoppingCart from './components/ShoppingCart';
import { __global__ } from '../../../src/mvvm/mvvm';

__global__["currency"] = "￥"

new App()
new ProductList()
new ShoppingCart()

