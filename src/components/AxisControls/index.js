'use strict';

var $ = require('jquery');
var _ = require('lodash');
var store = require('../../store');
var dispatcher = require('../../dispatcher');
var React = require('react');

/**
 * ## Axis Controls Component
 *
 * Component that handles mapping of attributes to axis.
 * Displays mappings selectors based on data received from upload process.
 */
var AxisControls = React.createClass({
    getInitialState: function() {
        return {
            mappings: store.get('mappings'),
            attributes: store.get('attributes'),
        }
    },

    componentDidMount: function () {
        store.on('change:attributes', () => {
            this.setState({
                attributes: store.get('attributes'),
                mappings: store.get('mappings'),
            });
        });
    },

    /**
     * Handles setting of new axis mappings. Makes a new axis mappings hash
     * and passes it on to the Dispatcher
     */
    submitHandler: function(e) {
        e.preventDefault();
        let mappings = _.clone(this.state.mappings);

        _.forEach(this.state.mappings, (mapping, axis) => {
            var selectValue = $(e.target).find('.axis-selector[name="' + axis + '"]').val();
            mappings[axis] = selectValue ? selectValue : null;
        });

        dispatcher.dispatch({actionType: 'axis-mappings-updated', mappings: mappings});
    },

    /**
     * Renders the form for Axis Mappings Form. If state does not have attributes (nothing was
     * uploaded yet), renders nothing
     */
    render: function() {
        if (!_.isEmpty(this.state.attributes)) {
            return (
                <form onSubmit={this.submitHandler} className="axis-controls controls-form">
                    {_.map(this.state.mappings, (mappedAttribute, axisName) => {
                        return (
                            <Axis key={axisName} attributes={this.state.attributes} mappedAttribute={mappedAttribute} name={axisName}/>
                        )
                    })}

                    <button className="button red">Go</button>
                </form>
            )
        } else {
            return null;
        }
    }
});

/**
 * ## Axis React Component
 *
 * Helper component that renders label and options drop down for a given axis
 */
var Axis = React.createClass({
    propTypes: {
        attributes: React.PropTypes.object.isRequired, // Array of attributes
        mappedAttribute: React.PropTypes.string, // Attribute name currently mapped to this axis
        name: React.PropTypes.string.isRequired, // Name of the axis
    },

    render: function() {
        let attributes = _.filter(_.keys(this.props.attributes), (attributeName) => !_.startsWith(attributeName, '_'));
        return (
            <div>
                <label className="axis-label" for={this.props.name}>{this.props.name}</label>
                <select name={this.props.name} id={this.props.name} className="axis-selector" defaultValue={this.props.mappedAttribute || ""}>
                    <option value="">not mapped</option>

                    {_.map(attributes, (attributeName) => {
                        return <option key={attributeName} value={attributeName}>{attributeName}</option>
                    })}
                </select>
            </div>
        )
    }
});

module.exports = AxisControls;
