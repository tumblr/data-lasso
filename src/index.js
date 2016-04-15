'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var React = require('react');
var ReactDom = require('react-dom');

var styles = require('./styles/index.scss');
var dispatcher = require('./dispatcher');
var defaults = require('./helpers/optionDefaults');
var store = require('./store');

var Uploader = require('./views/Uploader');
var AxisControls = require('./views/AxisControls');
var Graph = require('./views/Graph');
var Hud = require('./views/Hud');
var ModeIndicator = require('./views/ModeIndicator');
var SelectionControls = require('./views/SelectionControls');

/**
 * # Data Lasso View
 *
 * Main view for Data Lasso which handles receiving of options,
 * initializing sub views and modules, if any
 */

var DataLassoView = Backbone.View.extend({

    className: 'datalasso-container',

    defaults: defaults,

    initialize: function (options) {
        this.modules = options.modules;
        this.options = _.defaults({}, _.omit(options, 'modules'), this.defaults);

        dispatcher.dispatch({actionType: 'options-set', options: this.options});

        if (this.modules) {
            this.initializeModules(this.modules);
        }

        this.render();
    },

    /**
     * Initialize modules that can be plugged into
     * Data Lasso.
     *
     * Each module coming to Data Lasso is defined by a name
     * and a constructor function. That constructor function will
     * be called for every module with a hash containing:
     *
     *  - Event bus
     *  - Container element
     *  - Store
     *  - Dispatcher
     *
     * @param {array} modules: Data Lasso modules to use
     */
    initializeModules: function (modules) {
        this.modules = {};

        _.forEach(modules, function (module, name) {
            this.modules[name] = new module.constructor({
                store: store,
                dispatcher: dispatcher,
                $container: this.$el,
            });
        }, this);
    },

    render: function () {
        styles.append();

        ReactDom.render(<Uploader/>, this.el);

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
    },
});

module.exports = DataLassoView;

window.DataLasso = module.exports;
