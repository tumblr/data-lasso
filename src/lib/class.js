'use strict';

var _ = require('lodash');
var Backbone = require('backbone');

/**
 * Class object
 *
 * Mimics Backbone View's behavior
 * in terms of having initialize method
 */

var Class = function () {
    this.initialize.apply(this, arguments);
};

Class.extend = Backbone.Model.extend;

_.extend(Class, {
    initialize: function () {}
});

module.exports = Class;
