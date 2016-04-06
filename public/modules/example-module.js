'use strict';

/**
 * # Sample Data Lasso Module
 *
 * Data Lasso functionality can be extended using modules. Below
 * is an example of a simple module that displays count of
 * attributes in the data set.
 *
 * ## Setup
 *
 * First, information about the module must be passed to Data
 * Lasso upon initialization in options hash in the form of:
 *
 * ```
 * options.modules = {
 *   nameOfTheModule: {
 *     constructor: constructorFN
 *   }
 * }
 * ```
 *
 * ## Module structure
 *
 * Attributes can be simple objects, the only requirement is for
 * a module to have `initialize` method (following Backbone View
 * convention). That `initialize `method will be called on Data
 * Lasso initialization with hash consisting of these attributes:
 *
 * - events { Backbone.Events instance }
 *   Event bus of Data Lasso. Data lasso heavily uses events,
 *   so utilizing event bus can give you large controls of data
 *   lasso's internal workings
 *
 * - $container { jQuery object }
 *   Data Lasso container element. If your module has an interface,
 *   this is the element to append to.
 *
 * - store { Backbone.Model instance }
 *   Data Lasso store, containing current state. For a complete list
 *   of state attributes, refer to `/src/store/initialState.js`
 *
 * - dispatcher { Flux.Dispatcher instance }
 *   Action dispatcher of Data Lasso
 *
 */

var ExampleModule = Backbone.View.extend({

    className: 'sample-data-lasso-module',

    template: _.template("Data attributes count: <%= (_.keys(attributes)).length %>"),

    initialize: function (options) {
        this.dlEvents = options.events;
        this.dlStore = options.store;
        this.dlDispatcher = options.dispatcher;
        this.$container = options.$container;

        this.listenTo(this.dlStore, 'change:attributes', this._onNewInput);

        this.$el.css({
            'position': 'absolute',
            'top': '10px',
            'right': '10px',
            'color': '#ffffff'
        });

        this.render();
    },

    _onNewInput: function () {
        this.render(this.dlStore.get('attributes'));
    },

    render: function (attributes) {
        attributes || (attributes = []);
        this.$el.html(this.template({attributes: attributes}));
        this.$container.append(this.$el);
    }
});
