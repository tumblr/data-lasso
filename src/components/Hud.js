'use strict';

var _ = require('lodash');
var store = require('../store');
var React = require('react');

// Margin from HUD element to selected entry
var margin = 20;

/**
 * ## Heads Up Display Component
 *
 * Handles HUD that is displayed when you hover over
 * the entry on the graph.
 */
var Hud = React.createClass({
    getInitialState: function() {
        return {
            focused: store.get('focused'),
            mappings: store.get('mappings'),
            attributesInUse: [],
            top: 0,
            left: 0,
        }
    },

    componentDidMount: function() {
        store.on('change:focused', this.handleFocusedChange);
        store.on('change:mappings', this.handleMappingsChange);

        document.addEventListener('mousemove', _.throttle(_.bind(this.handleMouseMove, this), 50));
    },

    /**
     * Update internal state with entry that is currently in focus
     */
    handleFocusedChange: function() {
        this.setState({
            focused: store.get('focused'),
        })
    },

    /**
     * Update internal state with new axis mappings that were selected
     */
    handleMappingsChange: function() {
        let attributesInUse = _.filter(_.map(store.get('mappings'), (axis) => axis));
        this.setState({
            attributesInUse: attributesInUse || []
        });
    },

    /**
     * Update internal state with pointer coordinates
     */
    handleMouseMove: function (e) {
        this.setState({
            top: e.y + margin,
            left: e.x + margin,
        });
    },

    /**
     * Render the HUD if something is in focus and some attributes were mapped to axis
     * @returns {*}
     */
    render: function() {
        if (this.state.focused && this.state.attributesInUse.length) {
            let attributes = _.map(this.state.attributesInUse, (attribute) => {
                return {
                    name: attribute,
                    value: this.state.focused[attribute],
                }
            });
            let style = {
                top: this.state.top,
                left: this.state.left,
            };
            return (
                <div className="hud-container" style={style}>
                    {_.map(attributes, (attribute) => {
                        return (
                            <div key={attribute.name} className='attribute'>
                                <label className="attribute-name">{attribute.name}</label>
                                <span className="attribute-value">{attribute.value}</span>
                            </div>
                        )
                    })}
                </div>
            )
        } else {
            return null;
        }
    }
});

module.exports = Hud;
