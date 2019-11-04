'use strict';

module.exports = process.env.NODE_ENV === 'production' ?
    require('./_index.min.js') :
    require('./_index.js');