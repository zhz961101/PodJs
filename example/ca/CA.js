'use strict';

let app = Poi({
    el: "#app",
    tpl: "#app-template",
    data: {
        states: [],
        timer: null,
        play: (self)=>{
            if(self.timer!=null)return
            self.timer = setInterval(()=>{self.next(self)},1000)
        },
        stop: (self)=>{
            if(self.timer==null)return
            clearInterval(self.timer)
            self.timer = null
        },
        next: (self) => {
            if (self.states.length == 0) {
                self.random(self)
            }
            let isSurvival = (state, Neighbours) => {
                let saveCount = 0;
                for (let _s of Neighbours) {
                    saveCount += _s;
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
                    if(i<0||i>=10||j<0||j>=10){
                        return 0
                    }
                    return self.states[i][j]
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
            for (let rowi in self.states) {
                let row = self.states[rowi]
                let t_rows = []
                for (let celli in row) {
                    let cell = row[celli]
                    t_rows.push(isSurvival(cell, getNearArr(parseInt(rowi), parseInt(celli)))?1:0)
                }
                tempStates.push(t_rows)
            }
            self.states = tempStates
        },
        random: (self) => {
            // if(self.states.length!=0)return
            if(self.timer!=null)self.stop(self)
            let tempStates = []
            for (let i = 0; i < 10; i++) {
                let row = []
                for (let j = 0; j < 10; j++) {
                    row.push(Math.random()>0.5?1:0)
                }
                tempStates.push(row)
            }
            self.states = tempStates
        }
    },
    watch: {
        // msg:(self)=>{
        //     console.log(self);
        // }
    }
})
