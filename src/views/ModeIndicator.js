'use strict';

var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/mode-indicator.tpl');

/**
 * ## Mode Indicator View
 *
 * Handles visual feedback when mode is changed
 * between normal mode and selection mode.
 *
 */

var ModeIndicator = Backbone.View.extend({

    className: 'mode-indicator',

    mode: 'normal',

    initialize: function () {
        this.setupEventListeners();
    },

    setupEventListeners: function () {
        this.listenTo(events, 'datalasso:mode:selection', this.toggleSelectionMode);
        this.listenTo(events, 'datalasso:mode:normal', this.toggleNormalMode);
    },

    toggleSelectionMode: function () {
        this.mode = 'selection';
        this.render();
    },

    toggleNormalMode: function () {
        this.mode = 'normal';
        this.render();
    },

    render: function () {
        this.$el.html(template({
            mode: this.mode
        }));

        return this;
    }
});

module.exports = ModeIndicator;
