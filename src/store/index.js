'use strict';

var _ = require('lodash');
var Model = require('backbone').Model;
var events = require('../lib/events');
var datahelper = require('../helpers/data');
var initialState = require('./initialState');

/**
 * This is primary data store for Data Lasso. It also acts as a
 * coordinator in the data flow through the Data Lasso
 */

var DataModel = Model.extend({

    defaults: initialState,

    initialize: function () {
        this.listenTo(events, 'options-set', function (action) {
            this.options = action.options;
        });
        this.listenTo(events, 'datalasso:data:uploaded', this.processNewData);
        this.listenTo(events, 'datalasso:axismappings:updated', this.processAxisMappings);
        this.listenTo(events, 'datalasso:selection:new', this.newSelection); // Name these better
        this.listenTo(events, 'datalasso:selection:zoomin', this.zoomIntoSelection);
        this.listenTo(events, 'datalasso:selection:zoomout', this.zoomOutOfSelection);
        this.listenTo(events, 'datalasso:selection:download', this.downloadSelectedAsCSV);
        this.listenTo(events, 'datalasso:controls', function (action) {
            this.set({controls: action.on});
        });
        this.listenTo(events, 'datalasso:hud:update', function (action) {
            this.set({focused: action.focused});
        });
        this.listenTo(events, 'datalasso:hud:clear', function () {
            this.set({focused: null});
        });
        this.listenTo(events, 'datalasso:mode', function (action) {
            this.set({mode: action.mode});
        });
    },

    /**
     * New data was uploaded
     */
    processNewData: function (action) {
        var data = datahelper.processInput(action.entries, this.options);
        this.set({
            entries: data.entries,
            attributes: data.attributes,
            scales: data.scales
        });
    },

    /**
     * New axis mappings were selected
     */
    processAxisMappings: function (action) {
        this.set({
            mappings: action.mappings,
            scales: datahelper.getUpdatedScales(this.get('entries'), this.options)
        });
    },

    /**
     * New selection was made
     */
    newSelection: function (action) {
        var selectedEntries = action.selectedEntries;
        var entries = _.transform(this.get('entries'), function (result, entry) {
            entry.isSelected = (selectedEntries.indexOf(entry.__id) >= 0);
            result.push(entry);
        });

        this.set({
            entries: entries,
            selectedEntries: selectedEntries
        });
    },

    /**
     * Selection is zoomed in
     */
    zoomIntoSelection: function () {
        var newEntries = _.transform(this.get('entries'), function(result, entry) {
            if (entry.isSelected) {
                entry.isSelected = false;
                result.push(entry);
            }
        });

        this.saveDataSnapshot();
        this.set({
            entries: newEntries,
            selectedEntries: [],
            scales: datahelper.getUpdatedScales(newEntries, this.options)
        })
    },

    /**
     * Selection is zoomed out
     */
    zoomOutOfSelection: function () {
        this.restoreLastDataSnapshot();
    },

    /**
     * Preserve whatever is in `data` now in an array of
     * chronological snapshots
     */
    saveDataSnapshot: function () {
        var snapshots = this.get('snapshots') || [];
        snapshots.push(_.pick(this.toJSON(), ['entries', 'mappings', 'scales', 'attributes', 'selectedEntries']));
        this.set({
            snapshots: snapshots
        });
    },

    /**
     * Get last snapshot stored, and use that as current data object
     */
    restoreLastDataSnapshot: function () {
        var snapshots = this.get('snapshots');
        var lastSnapshot = snapshots.pop();
        this.set({
            entries: lastSnapshot.entries,
            mappings: lastSnapshot.mappings,
            scales: lastSnapshot.scales,
            attributes: lastSnapshot.attributes,
            selectedEntries: lastSnapshot.selectedEntries,
            snapshots: snapshots,
        });
    },

    /**
     * Generate CSV and trigger download
     */
    downloadSelectedAsCSV: function () {
        var csvContent = 'data:text/csv;charset=utf-8,';

        csvContent += _.keys(this.get('attributes')).join(',');

        _.each(this.get('selectedEntries'), function (entry, index) {
            csvContent += _.values(entry).join(',');
            csvContent += index < this.get('selectedEntries').length ? '\n' : '';
        }, this);

        window.open(encodeURI(csvContent));
    }
});

module.exports = new DataModel();
