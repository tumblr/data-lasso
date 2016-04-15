'use strict';

var _ = require('lodash');
var store = require('../store');
var dispatcher = require('../dispatcher');
var React = require('react');

/**
 * ## Axis Controls View
 *
 * View that handles mapping of attributes to axis.
 * Displays mappings selectors based on data received from
 * upload process.
 *
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

    submitHandler: function(e) {
        e.preventDefault();
        let mappings = _.clone(this.state.mappings);

        _.each(this.state.mappings, (mapping, axis) => {
            var selectValue = $(e.target).find('.axis-selector[name="' + axis + '"]').val();
            mappings[axis] = selectValue ? selectValue : null;
        });

        dispatcher.dispatch({actionType: 'axis-mappings-updated', mappings: mappings});
    },

    render: function() {
        if (!_.isEmpty(this.state.attributes)) {
            return (
                <form onSubmit={this.submitHandler} className="axis-controls controls-form">
                    {_.map(this.state.mappings, (mappedAttribute, axisName) => {
                        return (
                            <Axis key={axisName} attributes={this.state.attributes} mappedAttribute={mappedAttribute}
                                  name={axisName}/>
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

var Axis = React.createClass({
    render: function() {
        let attributes = _.filter(_.keys(this.props.attributes), (attributeName) => !_.startsWith(attributeName, '_'));
        return (
            <div>
                <label className="axis-label" for={this.props.name}>{this.props.name}</label>
                <select name={this.props.name} id={this.props.name} className="axis-selector">
                    <option value="">not mapped</option>

                    {_.map(attributes, (attributeName) => {
                        return <option selected={this.props.mappedAttribute === attributeName} value={attributeName}>{attributeName}</option>
                    })}
                </select>
            </div>
        )
    }
});

module.exports = AxisControls;
