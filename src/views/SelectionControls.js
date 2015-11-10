'use strict';

var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/selection-controls.tpl');

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
        this.listenTo(events, 'datalasso:selection:new', this.onNewSelection);
        this.listenTo(events, 'datalasso:data:new', this.onNewData);
        this.listenTo(events, 'datalasso:data:snapshots', this.onSnapshotsLengthChange);
    },

    onNewData: function (e) {
        this.entriesTotal = e.data.entries.length;
    },

    onSnapshotsLengthChange: function (count) {
        this.snapshotCount = count;
        this.render();
    },

    /**
     * ## On New Selection
     *
     * We received some new data on selections
     */
    onNewSelection: function (e) {
        this.selectedEntries = e.selectedEntries;
        this.render();
    },

    /**
     * ## Zoom INTO Selection
     *
     * Sends out an event and updates state
     */
    zoomIntoSelection: function () {
        events.trigger('datalasso:selection:zoomin');
        this.render();
    },

    /**
     * ## Zoom OUT OF Selection
     *
     * Just the opposite
     */
    zoomOutOfSelection: function () {
        events.trigger('datalasso:selection:zoomout');
        this.render();
    },

    downloadSelected: function () {
        events.trigger('datalasso:selection:download');
    },

    render: function () {
        this.$el.html(template({
            selectedEntries: this.selectedEntries,
            snapshotCount: this.snapshotCount || 0,
            entriesTotal: this.entriesTotal
        }));

        return this;
    }
});

module.exports = SelectionControls;
