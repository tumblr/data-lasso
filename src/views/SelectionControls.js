'use strict';

var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/selection-controls.tpl');
var store = require('../store');
var dispatcher = require('../dispatcher');

/**
 * ## Selection View
 *
 * Displays information on currently selected entries
 * and zooming in and out of a dataset
 *
 */

var SelectionControls = Backbone.View.extend({

    className: 'selection-controls',

    events: {
        'click [data-action="zoom-into-selection"]': 'zoomIntoSelection',
        'click [data-action="zoom-outof-selection"]': 'zoomOutOfSelection',
        'click [data-action="download-selected"]': 'downloadSelected'
    },

    initialize: function () {
        this.selectedEntries = [];

        this.setupEventListeners();
    },

    setupEventListeners: function () {
        this.listenTo(store, 'change:selectedEntries', this.onUpdate);
        this.listenTo(store, 'change:snapshots', this.onUpdate);
    },

    onUpdate: function () {
        var entriesTotal = store.get('entries').length;
        var selectedEntriesTotal = _.filter(store.get('entries'), 'isSelected').length;
        var snapshotCount = store.get('snapshots').length;

        this.render(entriesTotal, selectedEntriesTotal, snapshotCount);
    },

    /**
     * ## Zoom INTO Selection
     */
    zoomIntoSelection: function () {
        dispatcher.dispatch({actionType: 'zoom-in'});
    },

    /**
     * ## Zoom OUT OF Selection
     */
    zoomOutOfSelection: function () {
        dispatcher.dispatch({actionType: 'zoom-out'});
    },

    /**
     * Generate CSV and trigger download
     */
    downloadSelected: function () {
        var csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += _.keys(store.get('attributes')).join(',');

        _.each(store.get('entries'), function (entry, index) {
            if (entry.isSelected) {
                csvContent += _.values(entry).join(',');
                csvContent += (index < store.get('selectedEntries').length) ? '\n' : '';
            }
        }, this);
        window.open(encodeURI(csvContent));
    },

    render: function (entriesTotal, selectedEntriesTotal, snapshotCount) {
        this.$el.html(template({
            selectedEntriesTotal: selectedEntriesTotal || 0,
            snapshotCount: snapshotCount || 0,
            entriesTotal: entriesTotal || 0,
        }));

        return this;
    }
});

module.exports = SelectionControls;
