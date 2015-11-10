'use strict';

var _ = require('lodash');
var Model = require('backbone').Model;
var events = require('../lib/events');
var datahelper = require('../helpers/data');

/**
 * This is primary data store for Data Lasso. It also acts as a
 * coordinator in the data flow through the Data Lasso
 */

var DataModel = Model.extend({

    // TODO: Refactor to make it work and behave like a Model
    defaults: {
        entries: null,
        selectedEntries: [],
        mappings: null,
        scales: null,
        attributes: null
    },

    initialize: function (options) {
        this.options = options;
        this.setupEventListeners();

        // TODO: Put snapshots in it's own model
        this.dataSnapshots = [];
    },

    setupEventListeners: function () {
        // Data processing events
        this.listenTo(events, 'datalasso:data:uploaded', this.processNewData);

        // Axis mappings events (selecting what attribute will be on what axis)
        this.listenTo(events, 'datalasso:axismappings:updated', this.processAxisMappings);

        // Listen to things that have to do with selection
        this.listenTo(events, 'datalasso:selection:new', this.newSelection);
        this.listenTo(events, 'datalasso:selection:zoomin', this.zoomIntoSelection);
        this.listenTo(events, 'datalasso:selection:zoomout', this.zoomOutOfSelection);
        this.listenTo(events, 'datalasso:selection:download', this.downloadSelectedAsCSV);
    },

    /**
     * New data was uploaded
     */
    processNewData: function (e) {
        this.data = _.extend({}, this.defaults, datahelper.processInput(e.data, this.options));

        events.trigger('datalasso:input:processed', {
            data: this.data
        });
    },

    /**
     * New axis mappings were selected
     */
    processAxisMappings: function (e) {
        this.data.mappings = e.mappings;

        events.trigger('datalasso:data:new', {
            data: this.data
        });
    },

    /**
     * New selection was made
     */
    newSelection: function (e) {
        this.data.entries = e.entries;
        this.data.selectedEntries = e.selectedEntries;

        events.trigger('datalasso:data:new', {
            data: this.data
        });
    },

    /**
     * Selection is zoomed in
     */
    zoomIntoSelection: function () {
        if (this.data.selectedEntries && this.data.selectedEntries.length < this.data.entries.length) {

            this.saveDataSnapshot();
            this.data.entries = _.clone(this.data.selectedEntries);
            this.data.selectedEntries = [];
            this.data.scales = datahelper.getUpdatedScales(this.data.entries, this.options);

            events.trigger('datalasso:data:new', {
                data: this.data
            });

            events.trigger('datalasso:selection:new', {
                entries: this.data.entries,
                selectedEntries: this.data.selectedEntries
            });
        }
    },

    /**
     * Selection is zoomed out
     */
    zoomOutOfSelection: function () {
        this.restoreLastDataSnapshot();

        // Reset the drawing data
        events.trigger('datalasso:data:new', {
            data: this.data
        });

        // Reset the selection to where it was before
        events.trigger('datalasso:selection:new', {
            entries: this.data.entries,
            selectedEntries: this.data.selectedEntries
        });
    },

    /**
     * Preserve whatever is in `data` now in an array of
     * chronological snapshots
     */
    saveDataSnapshot: function () {
        this.dataSnapshots.push(_.clone(this.data));
        events.trigger('datalasso:data:snapshots', this.dataSnapshots.length);
    },

    /**
     * Get last snapshot stored, and use that as current data object
     */
    restoreLastDataSnapshot: function () {
        this.data = this.dataSnapshots.pop();
        this.restoreSelection();
        events.trigger('datalasso:data:snapshots', this.dataSnapshots.length);
    },

    /**
     * Restore the selection attributes on entries based on the list
     * of selected entries
     */
    restoreSelection: function () {
        var selectedIds = _.pluck(this.data.selectedEntries, '__id');

        _.each(this.data.entries, function (entry, index) {
            this.data.entries[index].isSelected = selectedIds.indexOf(entry.__id) > -1;
        }, this);
    },

    /**
     * Generate CSV and trigger download
     */
    downloadSelectedAsCSV: function () {
        var csvContent = 'data:text/csv;charset=utf-8,';

        csvContent += _.keys(this.data.attributes).join(',');

        _.each(this.data.selectedEntries, function (entry, index) {
            csvContent += _.values(entry).join(',');
            csvContent += index < this.data.selectedEntries.length ? '\n' : '';
        }, this);

        window.open(encodeURI(csvContent));
    }
});

module.exports = DataModel;
