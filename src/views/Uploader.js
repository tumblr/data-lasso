'use strict';

var _ = require('lodash');
var d3 = require('d3');
var Backbone = require('backbone');
var template = require('../templates/uploader.tpl');
var store = require('../store');
var dispatcher = require('../dispatcher');

/**
 * ## Upload Form View
 *
 * Handles UI and logic of loading data into Data Lasso
 * either using file or by requesting dataset from a URL
 */

var UploaderView = Backbone.View.extend({

    className: 'uploader',

    /**
     * What source type is currently selected
     */
    dataSource: 'file',

    /**
     * What format is the data source
     */
    fileType: 'csv',

    events: {
        'click [data-js-selector="data-source-toggle"]': 'onDataSourceClick',
        'click [data-js-selector="file-type-toggle"]': 'onFileTypeClick',

        'submit [data-js-selector="file-upload-form"]': 'onFileFormSubmit',
        'submit [data-js-selector="url-form"]': 'onUrlFormSubmit',
    },

    /**
     * Event handler for data source toggle click. Sets
     * `data-source` attribute on the $el to match selected data source
     *
     * @param e - DOM Event
     */
    onDataSourceClick: function (e) {
        var source = $(e.target).attr('data-source');
        this.$el.attr('data-source', source);
    },

    /**
     * Event handler for file type toggle click. Sets
     * `data-file-type` attribute on the $el to match selected file type
     *
     * @param e - DOM Event
     */
    onFileTypeClick: function (e) {
        var type = $(e.target).attr('data-type');
        this.$el.attr('data-file-type', type);
    },

    /**
     * Event listener for file upload form submit event
     *
     * @param e - DOM Event from which we get reference to file input
     */
    onFileFormSubmit: function (e) {
        e.preventDefault();

        var file = e.target[0].files[0];
        if (file) {
            this.setLoadingIndicator(true);
            var reader = new FileReader();
            reader.onload = _.bind(function (e) {
                this.loadData(e.target.result);
            }, this);
            reader.readAsText(file);
        }
    },

    /**
     * Event listener for url form submit event
     *
     * @param e - DOM Event from which we get URL to use
     */
    onUrlFormSubmit: function (e) {
        e.preventDefault();

        var url = e.target[0].value;
        if (url) {
            this.setLoadingIndicator(true);
            $.get(url)
                .then(_.bind(this.loadData, this))
                .fail(_.bind(this.onRequestFail, this));
        }
    },

    onRequestFail: function (jqXHR, status, error) {
        this.setLoadingIndicator(false);
        this.displayError(error);
    },

    /**
     * Parses file into an object based on it's type.
     * Uses d3's parsing to parse a string to an object
     *
     * @param {string} data - String to parse
     * @return {object} - List of entries to visualize
     */
    parseFile: function (data) {
        try {
            switch (this.fileType) {
                case 'csv':
                    return d3.csv.parse(data);
                case 'tsv':
                    return d3.tsv.parse(data);
                case 'json':
                    return JSON.parse(data);
            }
        } catch (e) {
            this.displayError(e);
            return null
        }
    },

    /**
     * Load the data to Data Lasso. Attempts to parse
     * uploaded or requested file first, and updates the state if succesfull.
     *
     * @param {string} data - String containg file that was uploaded or requested
     */
    loadData: function (data) {
        if (data) {
            var entries = this.parseFile(data);

            if (entries) {
                this.listenToOnce(store, 'change:entries', _.bind(this.setLoadingIndicator, this, false));
                dispatcher.dispatch({actionType: 'file-uploaded', entries: entries});
            } else {
                this.setLoadingIndicator(false);
            }
        } else {
            this.displayError();
        }
    },

    /**
     * Sets loading state on the Uploader component by
     * adding or removing `loading` class
     *
     * @param {boolean} isLoading - Should interface be seen as loading
     */
    setLoadingIndicator: function (isLoading) {
        this.$el.toggleClass('loading', isLoading);
    },

    /**
     * Display an error state to the user by applying an
     * animation that is added with `error` class
     */
    displayError: function () {
        this.$el.addClass('error');
        this.$el.on('animationend', _.bind(function () {
            this.$el.removeClass('error');
        }, this));
    },

    render: function () {
        this.$el.html(template());

        this.$el.attr('data-source', this.dataSource);
        this.$el.attr('data-file-type', this.fileType);

        return this;
    },
});

module.exports = UploaderView;
