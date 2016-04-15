'use strict';

var _ = require('lodash');
var store = require('../store');
var React = require('react');

/**
 * ## Heads Up Display View
 *
 * Handles HUD that is displayed when you hover over
 * the entry on the graph.
 *
 */

// Margin from HUD element to selected entry
var margin = 20;

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
        store.on('change:focused', this.onFocusedChange);
        store.on('change:mappings', this.onMappingsChange);

        document.addEventListener('mousemove', _.throttle(_.bind(this.reposition, this), 50));
    },

    onFocusedChange: function() {
        this.setState({
            focused: store.get('focused'),
        })
    },

    onMappingsChange: function() {
        let attributesInUse = _.filter(_.map(store.get('mappings'), (axis) => axis));
        this.setState({
            attributesInUse: attributesInUse || []
        });
    },

    /**
     * Just straight up position the element on the screen
     *
     * @param e - DOM event
     */
    reposition: function (e) {
        this.setState({
            top: e.y + margin,
            left: e.x + margin,
        });
    },

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
                            <div className='attribute'>
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
