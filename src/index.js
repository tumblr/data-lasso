'use strict';

var _ = require('lodash');
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

var DataLassoUI = React.createClass({
    render: function() {
        return (
            <div>
                <Uploader/>
                <AxisControls/>
                <Hud/>
                <ModeIndicator/>
                <SelectionControls/>
            </div>
        )
    }
});

var DataLasso = class DataLasso {
    constructor (options) {
        this.modules = options.modules;
        this.options = _.defaults(defaults, _.omit(options, 'modules'), this.defaults);

        dispatcher.dispatch({actionType: 'options-set', options: this.options});

        this.createElement();

        if (this.modules) {
            this.initializeModules(this.modules);
        }

        this.render();
    }

    createElement () {
        this.$el = $('<div></div>', {
            class: 'datalasso-container'
        });
        this.el = this.$el[0];
    }

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
    initializeModules (modules) {
        this.modules = {};

        _.forEach(modules, function (module, name) {
            this.modules[name] = new module.constructor({
                store: store,
                dispatcher: dispatcher,
                $container: this.$el,
            });
        }, this);
    }

    render () {
        styles.append();
        ReactDom.render(<DataLassoUI/>, this.el);
        this.graph = new Graph(this.options);
        this.$el.append(this.graph.el);
        return this.el;
    }
};

module.exports = DataLasso;

window.DataLasso = module.exports;
