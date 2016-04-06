'use strict';

var _ = require('lodash');
var THREE = require('three');
var events = require('../lib/events');
var Class = require('../lib/class');

/**
 * ## Mouse Helper
 *
 * Provides several helper functions that make
 * working with mouse position vector easier throughout
 * the data lasso
 *
 * @param $container - container that renderer uses
 */

var MouseHelper =  Class.extend({

    initialize: function ($container) {
        this.$container = $container;
        this.vector = new THREE.Vector2();

        this.vector.x = 0;
        this.vector.y = 0;

        this.$container[0].addEventListener('mousemove', _.bind(this.onMouseMove, this), false);
        this.$container[0].addEventListener('mousedown', _.bind(this.onMouseDown, this), false);
    },

    /**
     * Get position vector of the mouse
     *
     * @returns {THREE.Vector2|*}
     */
    position: function () {
        return this.vector;
    },

    /**
     * Event listener for `mousemove`
     */
    onMouseMove: function (e) {
        e.preventDefault();

        this.vector.x = (e.offsetX / window.innerWidth) * 2 - 1;
        this.vector.y = -((e.offsetY / window.innerHeight) * 2 + 1);

        events.trigger('datalasso:mouse:move', {
            vector: this.vector,
            x: e.offsetX,
            y: e.offsetY,
        });
    },

    /**
     * * Event listener for `mousedown`
     */
    onMouseDown: function (e) {
        events.trigger('datalasso:mouse:down', {
            button: e.button,
            vector: this.vector,
        });
    },
});


/**
 * Singleton-like behavior
 */
var _instance;

module.exports = function ($container) {
    if (!_instance) {
        _instance = new MouseHelper($container);
    }

    return _instance;
};
