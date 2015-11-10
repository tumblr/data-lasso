'use strict';

var _ = require('lodash');
var d3 = require('d3');

/**
 * ## Data Helper
 *
 * Helper module to handle processing of incoming data
 *
 */

var DataHelper = {

    processInput: function (data, options) {
        var entries = this._preProcessKnownFields(data);
        var attributes = this._processAttributes(entries);
        var scales = this._computeScales(attributes, options.graphSize);

        return {
            entries: entries,
            attributes: attributes,
            scales: scales
        };
    },

    getUpdatedScales: function (entries, options) {
        var attributes = this._processAttributes(entries);
        var scales = this._computeScales(attributes, options.graphSize);

        return scales;
    },

    /**
     * Process certain known fields into more useful ones.
     *
     * - Break down IP field into subnets (`ip`)
     * - Extract domain from eligible email fields (`email`)
     * - Break down geo onto city and country (`geo`)
     */
    _preProcessKnownFields: function (entries) {
        _.each(entries, function (entry, index) {
            entry.__id = index;

            if (entry.ip) {
                try {
                    var ipSegments = entry.ip.split('.');
                    delete entries[index].ip;
                    entries[index].ip4 = ipSegments.slice(0, 4).join('.');
                    entries[index].ip3 = ipSegments.slice(0, 3).join('.');
                    entries[index].ip2 = ipSegments.slice(0, 2).join('.');
                } catch (e) {}
            }

            if (entry.email) {
                try {
                    entries[index].emailDomain = entry.email.split('@')[1];
                } catch (e) {}
            }

            if (entry.geo) {
                try {
                    entries[index].country = entry.geo.split('~')[0];
                    entries[index].city = entry.geo.split('-')[1];
                } catch (e) {}
            }
        }, this);

        return entries;
    },


    /**
     * Break down incoming raw data into structured data
     * to be used in graphing; calculate possible variations
     * and extreme values for each attribute
     */
    _processAttributes: function (entries) {
        var attributes = {};

        _.each(entries, function (entry) {
            _.each(entry, function (value, name) {
                if (!attributes[name]) {
                    attributes[name] = {};
                    attributes[name].categories = {};
                }

                if (!attributes[name].categories[value]) {
                    attributes[name].categories[value] = 1;
                } else {
                    attributes[name].categories[value] += 1;
                }
            });
        });

        // To save computation time, categories are processed after the initial parsing
        var categories;

        _.each(attributes, function (attribute, name) {
            if (attribute.categories) {
                categories = [];

                _.each(attribute.categories, function (count, category) {
                    categories.push(category);
                }, this);

                attributes[name].categories = categories;
            }
        });

        // Sort category arrays
        _.each(attributes, function (attribute, name) {
            if (attribute.categories) {
                attributes[name].categories.sort();
            }
        });

        return attributes;
    },


    /**
     * Compute D3 scales for attributes and values in data
     */
    _computeScales: function (attributes, size) {
        var scales = {};

        _.each(attributes, function (attribute, name) {
            if (attribute.categories) {
                scales[name] = d3.scale.ordinal()
                    .domain(attribute.categories)
                    .rangePoints([0, size]);
            } else {
                scales[name] = d3.scale.linear()
                    .domain([attribute.min, attribute.max])
                    .range([0, size]);
            }
        }, this);

        return scales;
    }
};

module.exports = DataHelper;
