'use strict';

var _ = require('lodash');
var React = require('react');
var ReactDom = require('react-dom');

var styles = require('./styles/index.scss');
var dispatcher = require('./dispatcher');
var defaults = require('./helpers/optionDefaults');
var store = require('./store');

var Graph = require('./components/Graph');
var DataLassoUI = require('./components/DataLassoUI');


/**
 * # Data Lasso Class
 *
 * Class responsible for initialization of Data Lasso. Receives options,
 * creates DOM element for Data Lasso and initializes the rest of the components
 *
 */
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

    /**
     * Creates DOM element for Data Lasso
     */
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

    /**
     * Render Data Lasso:
     *  - Attach styles to the DOM
     *  - Render UI
     *  - Set up and render 3d space
     *
     * @returns {HTMLElement} - Element containing Data Lasso
     */
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
