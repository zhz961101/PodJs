"use static";

let poi_app1 = Poi({
    el: "#app1",
    tpl: `<p>{{= msg }}</p>
    <input type="text" name="" bind:value="msg" on:keyup="msg=self.value">`,
    data: {
        msg: "Poi! "
    }
})

let poi_app2 = Poi({
    el: "#app2",
    tpl: `<input type="text" name="" bind:value="msg" on:keyup="msg=self.value"><button type="button" name="button" on:click="reverseMsg()">reverse text</button><button type="button" name="button" on:click="msg=msg+msg">deouble!!</button><p>{{= msg }}</p>`,
    data: {
        msg: "Poi! ",
        reverseMsg: function() {
            this.msg = this.msg.split('').reverse().join('')
        }
    }
})

let poi_app3 = Poi({
    el: "#app3",
    tpl: `<button type="button" name="button" on:click="addRandom()">push random item!</button><ul>{{ for(let item of items){ }}<li>{{= item }}</li>{{ } }}</ul>`,
    data: {
        items: ["touch button"],
        addRandom: function() {
            this.items.push(Math.floor((Math.random() * 100)))
        }
    }
})
