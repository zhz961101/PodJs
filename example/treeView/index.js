const $ = q => document.querySelector.call(document,q)
Poi.mod("node",$("#nodetpl").innerHTML)

let data = {
    name: 'My Tree',
    opened: true,
    children: [{
            name: 'hello',
        },
        {
            name: 'wat',
        },
        {
            name: 'child folder',
            opened: true,
            children: [{
                    name: 'child folder',
                    opened: true,
                    children: [{
                            name: 'hello',
                        },
                        {
                            name: 'wat',
                        }
                    ]
                },
                {
                    name: 'hello',
                },
                {
                    name: 'wat',
                },
                {
                    name: 'child folder',
                    opened: false,
                    children: [{
                            name: 'hello',
                        },
                        {
                            name: 'wat',
                        }
                    ]
                }
            ]
        }
    ]
}

const app = new Poi({
    el: "#app",
    tpl: "<ul>{{$ node(TreeData)}}</ul>",
    data:{
        remit:1,
        TreeData: data
    }
})