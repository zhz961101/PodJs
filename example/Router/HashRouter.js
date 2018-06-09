'use strict';

let router = Poi({
    el: "#app",
    tpl: "#app-template2",
    pos:{
        rLink:{
            tpl: `<a href="#/{{ to }}" class="{{ state() }}">{{ _content }}</a>`,
            data: {
                state:function(){
                    if(this.currentPage=="/"+this.to){
                        return "active"
                    }
                    return ""
                }
            }
        }
    },
    // global:["currentPage"],
    data: {
        currentPage: "",
        go: function(pageRouter) {
            this.currentPage = pageRouter
            history.pushState(this.currentPage, document.title, '#' + this.currentPage)
        },
        isHidden:function(to){
            if(this.currentPage!="/"+to){
                return " hidden='hidden'"
            }
            else{
                return ""
            }
        }
    },
    mounted: {
        init: function() {
            let getId = () => {
                var id = window.location.hash;
                if (id) {
                    return id.replace('#', '');
                } else {
                    return "";
                }
            }
            let change = () => {
                this.currentPage = getId()
            }
            window.addEventListener("hashchange", change, false);
            this.currentPage = getId()
        }
    },
    watch: {
        // currentPage: self => {
        //     // console.log(self)
        // }
    }
})
