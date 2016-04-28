'use strict';

const React = require('react');

/**
 * # Url Upload Form React component
 *
 * Renders a form for downloading data set from a given URL
 */
const UrlForm = React.createClass({
    propTypes: {
        handleDataLoad: React.PropTypes.func.isRequired, // Function to call with uploaded data
    },

    getInitialState: function() {
        return {
            loading: false,
            error: false,
        }
    },

    /**
     * Handles submission of URL data set download form. Fires off XHR request and provides
     * callbacks for it's completion
     */
    handleFormSubmission: function(e) {
        e.preventDefault();

        var url = e.target[1].value;
        if (url) {
            this.setState({
                loading: true,
            });

            $.get(url)
                .then((data) => {this.props.handleDataLoad(data, this.dataLoadCallback)})
                .fail((jqXHR, status, error) => {
                    if (status === 'error' && !error) {
                        error = 'Error while making a request';
                    }
                    this.dataLoadCallback(error);
                });
        }
    },

    /**
     * Callback from parent component that is called when data is done
     * being processed
     *
     * @param {string} [error] - Error, if one happened during data processing
     */
    dataLoadCallback: function(error) {
        this.setState({
            loading: false,
            error: error,
        });
    },

    render: function() {
        return (
            <form onSubmit={this.handleFormSubmission} className="url-form">
                <UrlField error={this.state.error} />
                <div className="row">
                    <button className="button red">{this.state.loading ? 'LOADING...' : 'UPLOAD'}</button>
                </div>
            </form>
        )
    }
});

/**
 * ## UrlField React Component
 *
 * Helps with rendering the URL input field, as well as logic
 * to pre-populate that field with a test dataset
 */
const UrlField = React.createClass({
    getInitialState: function() {
        return {
            url: '',
        }
    },

    handleTestDatasetClick: function() {
        this.setState({
            url: 'http://tumblr.github.io/data-lasso/samples/UCS_Satellite_Database.csv',
        });
    },

    handleValueChange: function (e) {
        this.setState({
            url: e.target.value,
        });
    },

    render: function() {
        let inputStyle = {
            border: this.props.error ? '1px solid red' : '',
        };
        return (
            <div>
                <button className="button transparent" onClick={this.handleTestDatasetClick}>Use sample dataset</button>
                <input style={inputStyle} onChange={this.handleValueChange} value={this.state.url} type="text" placeholder="URL to a file" className="text-input url-input"/>
            </div>
        )
    }
});

module.exports = UrlForm;
