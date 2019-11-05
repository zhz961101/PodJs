'use strict';
module.exports = process.env.NODE_ENV === 'production' ?
    require('./dist/taco.min.js') :
    require('./dist/taco.js');