'use strict';

var $ = require('jquery');
var _ = require('lodash');
var React = require('react');
var ReactDom = require('react-dom');

var styles = require('./styles/index.scss');
var dispatcher = require('./dispatcher');
var store = require('./store');

var Graph = require('./graph');
var DataLassoUI = require('./components/DataLassoUI');

/**
 * Default options that Data Lasso is initialized with that can be overwritten
 */
var defaults = {
    /** Size of the graph */
    graphSize: 2000,
    /** Size of the axis legend text */
    legendSize: 50,
    /** Color of the legend text */
    legendColor: 0xffffff,
};

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
            // We want to defer initialization of modules to give time for data lasso to start up
            setTimeout(this.initializeModules.bind(this, this.modules))
        }

        this.render();
    }

    /**
     * Creates DOM element for Data Lasso
     */
    createElement () {
        this.el = document.createElement('div');
        this.el.className = 'datalasso-container'
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
        this.modules = _.transform(modules, (result, module, name) => {
            result[name] = new module.constructor({
                store: store,
                dispatcher: dispatcher,
                container: this.el,
            });
        });
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
        ReactDom.render(<DataLassoUI/>, this.el);
        this.graph = new Graph(this.options);
        this.el.appendChild(this.graph.el);
        return this.el;
    }
};

module.exports = DataLasso;

window.DataLasso = module.exports;
