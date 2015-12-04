'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var DataModel = require('./models/Data');
var Uploader = require('./views/Uploader');
var AxisControls = require('./views/AxisControls');
var Graph = require('./views/Graph');
var Hud = require('./views/Hud');
var ModeIndicator = require('./views/ModeIndicator');
var SelectionControls = require('./views/SelectionControls');
var events = require('./lib/events');
var styles = require('./styles/index.scss');

var DataLassoView = Backbone.View.extend({

    className: 'datalasso-container',

    /**
     * All options that can be overwritten
     * from outside of Data Lasso defined below.
     */
    defaults: {
        // Size of the graph
        graphSize: 2000,

        // Size of the axis legend text
        legendSize: 50,

        // Color of the legend text
        legendColor: 0xffffff
    },

    initialize: function (options) {
        this.options = _.defaults({}, _.omit(options, 'modules'), this.defaults);

        this.data = new DataModel(this.options);

        if (options.modules) {
            this.initializeModules(options.modules);
        }

        this.render();
    },

    /**
     * Initialize modules that can be plugged into
     * Data Lasso.
     *
     * Each module coming to Data Lasso is defined by a name
     * and a constructor function. That constructor function will
     * be called for every module with data lasso event bus and
     * container element in options
     */
    initializeModules: function (modules) {
        this.modules = {};

        _.each(modules, function (module, name) {
            this.modules[name] = new module.constructor({
                events: events,
                $container: this.$el
            });
        }, this);
    },

    render: function () {
        styles.append();
        
        // Uploader
        this.uploader = new Uploader();
        this.$el.append(this.uploader.render().el);

        // Axis Controls
        this.axisControls = new AxisControls(this.options);
        this.$el.append(this.axisControls.render().el);

        // Axis Controls
        this.graph = new Graph(this.options);
        this.$el.append(this.graph.render().el);

        // HUD
        this.hud = new Hud();
        this.$el.append(this.hud.render().el);

        // Mode indicator
        this.modeIndicator = new ModeIndicator();
        this.$el.append(this.modeIndicator.render().el);

        // Selection controls
        this.selectionControls = new SelectionControls();
        this.$el.append(this.selectionControls.render().el);

        return this;
    }
});

module.exports = DataLassoView;

window.DataLasso = module.exports;
