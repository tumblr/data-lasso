'use strict';

var React = require('react');

/**
 * # Toggle React component
 *
 * Renders a single toggle
 */
const Toggle = React.createClass({
    propTypes: {
        isActive: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        children: React.PropTypes.node.isRequired,
    },

    render: function() {
        let classes = this.props.isActive ? 'toggle active' : 'toggle';
        return (
            <button onClick={this.props.onClick} className={classes}>{this.props.children}</button>
        )
    }
});

module.exports = Toggle;
