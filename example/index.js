'use strict';

let app = Poi({
    el: "#app1",
    data: {
        msg: "Poi! ",
        items: ["touch random!"],
        addRandom() {
            // this.items = this.items + [(Math.floor((Math.random() * 100)))]
            this.items.push(Math.floor((Math.random() * 100)))
            // console.log(self.items)
        },
        popone(){
            this.items.pop()
        },
        reverseMsg() {
            this.msg = this.msg.split('').reverse().join('')
        }
    },
    watch: {
        msg: self => {
            console.log(self)
        },
        items: self => {
            console.log(self,self.length)
        }
    }
})
