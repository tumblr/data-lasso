'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var events = require('../lib/events');
var mappings = require('../lib/mappings');
var template = require('../templates/axis-controls.tpl');

/**
 * ## Axis Controls View
 *
 * View that handles mapping of attributes to axis.
 * Displays mappings selectors based on data received from
 * upload process.
 *
 */

var AxisControls = Backbone.View.extend({

    className: 'axis-controls',

    /**
     * Template of an object that contains available axis
     */
    mappings: mappings,

    events: {
        'submit form': 'onSubmit'
    },

    initialize: function () {
        this.listenTo(events, 'datalasso:input:processed', this.refreshWithNewData);
    },

    /**
     * Listen to when new data comes in and re-render
     * the element with new set of attributes to map
     */
    refreshWithNewData: function (e) {
        this.render(e.data.attributes);
    },

    /**
     * Event listener for when new mappings are selected
     */
    onSubmit: function (e) {
        e.preventDefault();

        _.each(this.mappings, function (mapping, axis) {
            var selectValue = this.$('.axis-selector[name="'+axis+'"]').val();
            this.mappings[axis].attribute = selectValue ? selectValue : null;
        }, this);

        events.trigger('datalasso:axismappings:updated', {
            mappings: this.mappings
        });
    },

    render: function (attributes) {
        this.$el.html(template({
            mappings: this.mappings,
            attributes: attributes
        }));

        return this;
    }
});

module.exports = AxisControls;
