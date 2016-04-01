'use strict';

var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/mode-indicator.tpl');
var store = require('../store');

/**
 * ## Mode Indicator View
 *
 * Handles visual feedback when mode is changed
 * between normal mode and selection mode.
 *
 */

var ModeIndicator = Backbone.View.extend({

    className: 'mode-indicator',

    initialize: function () {
        this.setupEventListeners();
    },

    setupEventListeners: function () {
        this.listenTo(store, 'change:mode', this.toggleMode);
    },

    toggleMode: function () {
        this.render(store.get('mode'));
    },

    render: function (mode) {
        mode || (mode = 'normal');

        this.$el.html(template({
            mode: mode
        }));

        return this;
    }
});

module.exports = ModeIndicator;
