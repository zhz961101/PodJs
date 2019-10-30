import { Store } from '../../../../src/store/store';
import { reactive } from '../../../../src/reactivity/reactivity';
import Product from '../models/Product';
import shop from '../api/shop';

// =========================
// Product
// =========================

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

// =========================
// Cart
// =========================

interface CartItem {
    id: number
    quantity: number
}

interface CartState {
    items: Array<CartItem>
    checkoutStatus: string
}

export const cartState = reactive<CartState>({
    items: new Array<CartItem>(),
    checkoutStatus: ""
})

export const cart = new Store(function setup() {
    // getters
    function cartProducts() {
        return cartState.items.map(({ id, quantity }) => {
            const product = productState.all.find(product => product.id === id)
            return {
                title: product.title,
                price: product.price,
                quantity
            }
        })
    }
    function cartTotalPrice() {
        return cartProducts().reduce((total, product) => {
            return total + product.price * product.quantity
        }, 0)
    }

    // actions
    function checkout(products: any) {
        const savedCartItems = [...cartState.items]
        cart.dispatch('setCheckoutStatus', "")
        // empty cart
        cart.dispatch('setCartItems', { items: [] })
        shop.buyProducts(products)
            .then(() => {
                cart.dispatch('setCheckoutStatus', 'successful')
            })
            .catch(() => {
                cart.dispatch('setCheckoutStatus', 'failed')
                // rollback to the cart saved before sending the request
                cart.dispatch('setCartItems', { items: savedCartItems })
            })
    }
    function addProductToCart(product: Product) {
        cart.dispatch('setCheckoutStatus', "")
        if (product.inventory > 0) {
            const cartItem = cartState.items.find(item => item.id === product.id)
            if (!cartItem) {
                cart.dispatch('pushProductToCart', { id: product.id })
            } else {
                cart.dispatch('incrementItemQuantity', cartItem)
            }
            // remove 1 item from stock
            products.dispatch('decrementProductInventory', { id: product.id })
        }
    }

    // mutations
    function pushProductToCart({ id }: { id: number }) {
        cartState.items.push({
            id,
            quantity: 1
        })
    }
    function incrementItemQuantity({ id }: { id: number }) {
        const cartItem = cartState.items.find(item => item.id === id)
        cartItem.quantity++
    }
    function setCartItems({ items }: { items: Array<CartItem> }) {
        cartState.items = items
    }
    function setCheckoutStatus(status: string) {
        cartState.checkoutStatus = status
    }
    return {
        cartProducts,
        cartTotalPrice,
        checkout,
        addProductToCart,
        pushProductToCart,
        incrementItemQuantity,
        setCartItems,
        setCheckoutStatus
    }
})
