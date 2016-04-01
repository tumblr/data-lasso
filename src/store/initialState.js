'use strict';

/**
 * # Initial State
 *
 * This object contains initial state of the data store.
 */
module.exports = {
    // List of entries (records) to visualize
    entries: null,

    // List D3 scales - one scale per axis
    scales: null,

    // List of attributes in the data set
    // For numerical attributes also contains min/max values
    // For categorical attributes also contains list of factors
    attributes: null,

    // List of IDs of selected entries
    selectedEntries: [],

    // Snapshots of data that changes when zooming is performed
    snapshots: [],

    // Flag that determines whether controls (pan, zoom, rotate) are on or off
    controls: true,

    // UI mode. Currently has two values, 'normal' and 'selection'
    mode: 'normal',

    // Mappings of attributes to axes
    mappings: {
        x: null,
        y: null,
        z: null,
        color: null,
    },
};
