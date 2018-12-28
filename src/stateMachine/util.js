
function getEventKey(states){
    let ret = []
    for(let o of Object.values(states))ret = ret.concat(Object.keys(o))
    return ret
}

function getEvents(conf, data){
    let eventsKey = getEventKey(conf.states)
    let events = {}
    for (const e of eventsKey) {
        events[e] = fn =>data[e] = fn
    }
    return events
}

module.exports = {
    getEvents
}
