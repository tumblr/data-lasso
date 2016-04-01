'use strict';

var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/selection-controls.tpl');
var store = require('../store');

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
        events.trigger('datalasso:selection:zoomin');
    },

    /**
     * ## Zoom OUT OF Selection
     */
    zoomOutOfSelection: function () {
        events.trigger('datalasso:selection:zoomout');
    },

    downloadSelected: function () {
        events.trigger('datalasso:selection:download');
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
