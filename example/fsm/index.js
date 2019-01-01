
let app = new Poi({
    el : "#app",
    tpl: "#tpl",
    data:{
        red:false,
        yellow:false,
        green:true
    },
    initState: "green",
    states: {
        green: {
            warn(type, ev) {
                console.log("warn!")
                this.data.yellow = true
                this.data.green = false
                return "yellow"
            }
        },
        red: {
            ready(type, ev) {
                console.log("ready to go")
                this.data.red = false
                this.data.yellow = true
                return "yellow"
            }
        },
        yellow: {
            go(type, ev) {
                console.log("go!")
                this.data.green = true
                this.data.yellow = false
                return "green"
            },
            stop(type, ev) {
                console.log("stop!now!")
                this.data.red = true
                this.data.yellow = false
                return "red"
            }
        }
    },
    // events: {
    //     warn(fn) {
    //         this.data["warn"] = fn
    //     },
    //     ready(fn) {
    //         this.data["ready"] = fn
    //     },
    //     go(fn) {
    //         this.data["go"] = fn
    //     },
    //     stop(fn) {
    //         this.data["stop"] = fn
    //     }
    // },
    error(to, ev) {
        console.log(`${this.currentState} =/=> ${to} !`)
    }
})
