'use strict';

var _ = require('lodash');
var d3 = require('d3');
var Backbone = require('backbone');
var events = require('../lib/events');
var template = require('../templates/uploader.tpl');

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
        var data;

        switch (this.getSelectedType()) {
            case 'csv':
                data = d3.csv.parse(e.target.result);
                break;
            case 'tsv':
                data = d3.tsv.parse(e.target.result);
                break;
            case 'json':
                data = JSON.parse(e.target.result);
                break;
        }

        // Triggers data processing on the data model
        events.trigger('datalasso:data:uploaded', {data: data});

        this.listenToOnce(events, 'datalasso:input:processed', this.toggleLoadingIndicator());
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
