'use strict';

var _ = require('lodash');
var d3 = require('d3');
var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/uploader.tpl');
var store = require('../store');

/**
 * ## Upload Form View
 *
 * Contains logic of uploading files into data lasso
 * to be visualized.
 *
 */

var UploaderView = Backbone.View.extend({

    className: 'uploader',

    events: {
        'submit form': 'onFormSubmit'
    },

    /**
     * Get whatever filetype was checked
     *
     * @returns 'csv'|'tsv'|'json'
     */
    getSelectedType: function () {
        var $selectedToggle = this.$formatToggles.filter(':checked');
        return $selectedToggle.val();
    },

    /**
     * Event listener for form submit event
     */
    onFormSubmit: function (e) {
        e.preventDefault();

        var file = this.$fileUpload[0].files[0];

        if (file) {
            var reader = new FileReader();
            reader.onload = _.bind(this.readerOnload, this);
            reader.readAsText(file);
            this.toggleLoadingIndicator();
        }
    },

    /**
     * Callback for when file was accepted and read. Parses file
     * into an object and passes it further down the flow
     */
    readerOnload: function (e) {
        var entries;

        switch (this.getSelectedType()) {
            case 'csv':
                entries = d3.csv.parse(e.target.result);
                break;
            case 'tsv':
                entries = d3.tsv.parse(e.target.result);
                break;
            case 'json':
                entries = JSON.parse(e.target.result);
                break;
        }

        events.trigger('datalasso:data:uploaded', {entries: entries});

        this.listenToOnce(store, 'change:entries', this.toggleLoadingIndicator());
    },

    toggleLoadingIndicator: function () {
        this.$el.toggleClass('loading');
    },

    render: function () {
        this.$el.html(template());

        this.$fileUpload = this.$('[type="file"]');
        this.$formatToggles = this.$('[name="type"]');

        return this;
    }
});

module.exports = UploaderView;
