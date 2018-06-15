'use strict';
var maxX = 10,maxY = 10;
let app2 = Poi({
    el: "#app2",
    tpl: `<button type="button" name="button" on:click="random(true)">random</button><button type="button" name="button" on:click="next()">Next step</button><hr><div class="container">{{ for(let i = 0;i<states.length ;i++){ }}{{ for(let j = 0;j<states[0].length ;j++){ }}<div class={{ (states[i][j]?'"item live"':'"item"')}}></div>{{ } }}{{ } }}</div><hr>`,
    data: {
        states: [],
        next: function(){
            if (this.states.length == 0) {
                this.random(false)
                return
            }
            let isSurvival = (state, Neighbours) => {
                let saveCount = 0;
                for (let cell_state of Neighbours) {
                    saveCount += cell_state?1:0;
                }
                if (state == 1) {
                    if (saveCount < 2) {
                        return false
                    }
                    if (saveCount > 3) {
                        return false
                    }
                    return true
                } else {
                    if (saveCount == 3) {
                        return true
                    } else {
                        return false
                    }
                }
            }
            let getNearArr = (rows, celli) => {
                let temp = []
                let getStates = (i,j)=>{
                    if(i<0||i>=maxX||j<0||j>=maxY){
                        return 0
                    }
                    return this.states[i][j]
                }
                temp.push(getStates(rows - 1,celli - 1))
                temp.push(getStates(rows - 1,celli))
                temp.push(getStates(rows - 1,celli + 1))
                temp.push(getStates(rows + 1,celli - 1))
                temp.push(getStates(rows + 1,celli))
                temp.push(getStates(rows + 1,celli + 1))
                temp.push(getStates(rows,celli - 1))
                temp.push(getStates(rows,celli + 1))
                for (let _t of temp) {
                    if (_t == undefined) _t = 0
                }
                return temp
            }
            let tempStates = []
            for (let rowi in this.states) {
                let row = this.states[rowi]
                let t_rows = []
                for (let celli in row) {
                    let cell = row[celli]
                    t_rows.push(isSurvival(cell, getNearArr(parseInt(rowi), parseInt(celli)))?true:false)
                }
                tempStates.push(t_rows)
            }
            this.states = tempStates
        },
        random: function(clear){
            let tempStates = []
            for (let i = 0; i < maxX; i++) {
                let row = []
                for (let j = 0; j < maxY; j++) {
                    row.push(Math.random()>0.5?true:false)
                }
                tempStates.push(row)
            }
            this.states = tempStates
        }
    },
    mounted: {
        init: function() {
            this.random();
        }
    }
})

let app1 = Poi({
    el: "#app1",
    tpl: `<input type="text" bind:value="inputText" on:keyup="inputText=self.value"><button type="button" name="button" on:click="add()" >add</button><ul>{{ for(let todoi in todos){ }}<li class= "{{ todos[todoi].state?"ok":"continue" }}" on:click="toggle({{ todoi }})">{{ todos[todoi].content }}</li>{{ } }}</ul>`,
    data: {
        todos: [{state:false,content:"早睡早起"}],
        inputText: "",
        add: function(){
            if(this.inputText=="")return
            if(this.inputText==this.todos[this.todos.length-1].content){this.inputText="";return}
            this.todos.push({
                state: false,
                content: this.inputText
            })
            this.inputText=""
        },
        toggle: function(index){
            this.todos[index].state = !this.todos[index].state
            // debuger
            // console.log(this.todos,index)
        }
    }
})
