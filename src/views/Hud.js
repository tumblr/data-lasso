'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/hud.tpl');

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
        this.listenTo(events, 'datalasso:hud:update', this.update);
        this.listenTo(events, 'datalasso:mouse:move', this.reposition);
        this.listenTo(events, 'datalasso:axismappings:updated', this.onNewMappings);
    },

    /**
     * Just straight up position the element on the screen
     */
    reposition: function (e) {
        this.$el.css({
            top: e.y + margin,
            left: e.x + margin
        });
    },

    /**
     * Something is hovered over so display must be enabled
     */
    update: function (entry) {
        this.$el.html(template({
            entry: entry,
            attributesInUse: this.attributesInUse
        }));
    },

    /**
     * When new axis mappings are selected, we store
     * which attributes were selected to only use them
     */
    onNewMappings: function (e) {
        var mappings = e.mappings;

        this.attributesInUse = _.map(mappings, function (axis) {
            return axis.attribute;
        }) || [];
    },

    render: function () {
        return this;
    }
});

module.exports = HudView;
