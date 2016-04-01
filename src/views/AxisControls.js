'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/axis-controls.tpl');
var store = require('../store');

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

    events: {
        'submit form': 'onSubmit'
    },

    initialize: function () {
        this.listenTo(store, 'change:attributes', this.refreshWithNewData);
    },

    /**
     * Listen to when new data comes in and re-render
     * the element with new set of attributes to map
     */
    refreshWithNewData: function (store) {
        this.attributes = store.get('attributes');
        this.mappings = store.get('mappings');
        this.render();
    },

    /**
     * Event listener for when new mappings are selected
     */
    onSubmit: function (e) {
        e.preventDefault();
        var mappings = _.clone(this.mappings);

        _.each(this.mappings, function (mapping, axis) {
            var selectValue = this.$('.axis-selector[name="'+axis+'"]').val();
            mappings[axis] = selectValue ? selectValue : null;
        }, this);

        events.trigger('datalasso:axismappings:updated', {
            mappings: mappings
        });
    },

    render: function () {
        this.$el.html(template({
            mappings: this.mappings,
            attributes: this.attributes
        }));

        return this;
    }
});

module.exports = AxisControls;
