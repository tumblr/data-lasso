'use strict';

var _ = require('lodash');
var Model = require('backbone').Model;
var events = require('../lib/events');
var datahelper = require('../helpers/data');
var initialState = require('./initialState');
var dispatcher = require('../dispatcher');

/**
 * This is primary data store for Data Lasso. It also acts as a
 * coordinator in the data flow through the Data Lasso
 */

var DataModel = Model.extend({

    defaults: initialState,

    initialize: function () {
        dispatcher.register(_.bind(this.dispatchCallback, this));
    },

    /**
     * Benefit of the dispatcher: No simultaneous execution.
     * Avoid cascading effect by preventing nested updates
     * @param action
     */
    dispatchCallback: function (action) {
        switch (action.actionType) {
            case 'options-set':
                this.options = action.options;
                break;

            case 'file-uploaded':
                this.onFileUpload(action);
                break;

            case 'selection-started':
                this.onSelectionStart();
                break;

            case 'selection-stopped':
                this.onSelectionStop();
                break;

            case 'selection-made':
                this.newSelection(action);
                break;

            case 'axis-mappings-updated':
                this.processAxisMappings(action);
                break;

            case 'entry-hovered':
                this.set({focused: action.entry});
                break;

            case 'zoom-in':
                this.zoomIntoSelection();
                break;

            case 'zoom-out':
                this.zoomOutOfSelection();
                break;
        }
    },

    /**
     * New data was uploaded
     */
    onFileUpload: function (action) {
        var data = datahelper.processInput(action.entries, this.options);
        this.set({
            entries: data.entries,
            attributes: data.attributes,
            scales: data.scales
        });
    },

    onSelectionStart: function () {
        this.set({
            mode: 'selection',
            controls: false,
        });
    },

    onSelectionStop: function () {
        this.set({
            mode: 'normal',
            controls: true,
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
});

module.exports = new DataModel();
