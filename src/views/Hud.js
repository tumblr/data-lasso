'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/hud.tpl');
var store = require('../store');

/**
 * ## Heads Up Display View
 *
 * Handles HUD that is displayed when you hover over
 * the entry on the graph.
 *
 */

// Margin from HUD element to selected entry
var margin = 20;

var HudView = Backbone.View.extend({

    className: 'hud-container',

    initialize: function () {
        this.setUpEventListeners();
    },

    /**
     * Set up various event listeners
     */
    setUpEventListeners: function () {
        this.listenTo(store, 'change:focused', this.update);
        this.listenTo(events, 'datalasso:mouse:move', this.reposition);
        this.listenTo(store, 'change:mappings', this.onNewMappings);
    },

    /**
     * Just straight up position the element on the screen
     */
    reposition: function (e) {
        this.$el.css({
            top: e.y + margin,
            left: e.x + margin,
        });
    },

    /**
     * Something is hovered over so display must be enabled
     */
    update: function () {
        var entry = store.get('focused');
        this.$el.html(template({
            entry: entry,
            attributesInUse: this.attributesInUse,
        }));
    },

    /**
     * When new axis mappings are selected, we store
     * which attributes were selected to only use them
     */
    onNewMappings: function () {
        var mappings = store.get('mappings');

        this.attributesInUse = _.map(mappings, function (axis) {
            return axis;
        }) || [];
    },

    render: function () {
        return this;
    },
});

module.exports = HudView;
