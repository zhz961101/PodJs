'use strict';

let app = Poi({
    el: "#app1",
    data: {
        msg: "Poi! ",
        items: ["touch random!"],
        addRandom: function() {
            this.items.push(Math.floor((Math.random() * 100)))
            // console.log(self.items)
        },
        reverseMsg: function() {
            this.msg = this.msg.split('').reverse().join('')
        }
    },
    watch: {
        msg: self => {
            console.log(self)
        },
        items: self => {
            console.log(self)
        }
    }
})
