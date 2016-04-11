'use strict';

var _ = require('lodash');
var Events = require('backbone').Events;
var THREE = require('three');
var Class = require('../lib/class');

/**
 * ## Mouse Helper
 *
 * Provides an interface that makes working with mouse position
 * easier by translating DOM mouse position to a THREE vector
 *
 * @param $container - container that renderer uses
 */

var Mouse = Class.extend({

    initialize: function ($container) {
        _.extend(this, Events);

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
     * @returns {THREE.Vector2} - three.js vector for mouse cursor position
     */
    position: function () {
        return this.vector;
    },

    /**
     * Event listener for `mousemove`
     *
     * @param e - DOM event
     */
    onMouseMove: function (e) {
        this.vector.x = (e.offsetX / window.innerWidth) * 2 - 1;
        this.vector.y = -(e.offsetY / window.innerHeight) * 2 + 1;

        this.trigger('datalasso:mouse:move', {
            vector: this.vector,
            x: e.offsetX,
            y: e.offsetY,
        });
    },

    /**
     * Event listener for `mousedown`
     *
     * @param e - DOM event
     */
    onMouseDown: function (e) {
        this.trigger('datalasso:mouse:down', {
            button: e.button,
            vector: this.vector,
        });
    },
});

module.exports = Mouse;
