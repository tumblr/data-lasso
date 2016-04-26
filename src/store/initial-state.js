'use strict';

/**
 * # Initial State
 *
 * This object contains initial state of the data store.
 */
module.exports = {

    /**
     * List of entries (records) to visualize
     */
    entries: [],

    /**
     * List D3 scales - one scale per axis
     */
    scales: [],

    /**
     * List of attributes in the data set. For numerical attributes also contains min/max
     * values, for categorical attributes also contains list of factors
     */
    attributes: [],

    /**
     * List of IDs of selected entries
     */
    selectedEntries: [],

    /**
     * List of snapshots of data that changes when zooming is performed
     */
    snapshots: [],

    /**
     * Flag that determines whether controls (pan, zoom, rotate) are on or off
     */
    controls: true,

    /**
     * UI mode. Currently has two possible values:
     *  - 'view'
     *  - 'selection'
     */
    mode: 'view',

    /**
     * Selection modifier - adding or subtracting from current selection
     *  - 'add'
     *  - 'subtract'
     */
    selectionModifier: null,

    /**
     * Object containing mappings of attributes to axes
     */
    mappings: {
        x: null,
        y: null,
        z: null,
        color: null,
    },

    source: 'file',

    type: 'csv',
};
