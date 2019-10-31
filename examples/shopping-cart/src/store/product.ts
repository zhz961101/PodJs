import { Store } from '../../../../src/store/store';
import { reactive } from '../../../../src/reactivity/reactivity';
import Product from '../models/Product';
import shop from '../api/shop';

interface ProductState {
    all: Array<Product>
}

export const productState = reactive<ProductState>({
    all: new Array<Product>()
})

export const products = new Store(function setup() {
    return {
        setProducts(products) {
            productState.all = products
        },
        decrementProductInventory({ id }: { id: number } = { id: null }) {
            if (id === null) return
            const product = productState.all.find(product => product.id === id)
            product.inventory--
        },
        getAllProducts() {
            shop.getProducts().then(_products => {
                products.dispatch("setProducts", _products)
            })
        }
    }
})
