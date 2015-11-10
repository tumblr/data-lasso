'use strict';

var _ = require('lodash');
var Backbone = require('backbone');

/**
 * Event Bus
 *
 * Extends Backbone.events
 */

var EventBus = function () {};
EventBus.extend = Backbone.Model.extend;
_.extend(EventBus.prototype, Backbone.Events);

module.exports = new EventBus();
