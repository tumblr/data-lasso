'use strict';

const React = require('react');

/**
 * # File Form React component
 *
 * Renders a form for file upload and handles reading uploaded file
 */
const FileForm = React.createClass({
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
     * Handles submission of file upload form. Reads the file and passes data up
     * to a parent component
     */
    handleFormSubmission: function(e) {
        e.preventDefault();

        var file = e.target[0].files[0];
        if (file) {
            var reader = new FileReader();

            this.setState({
                loading: true,
            });

            reader.onload = (e) => {
                this.props.handleDataLoad(e.target.result, this.dataLoadCallback);
            };
            reader.readAsText(file);
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
        let inputStyle = {
            border: (!!this.state.error) ? '1px solid red' : '',
        };
        return (
            <form onSubmit={this.handleFormSubmission} className="file-upload-form">
                <div className="row">
                    <input style={inputStyle} type="file" className="file-upload-input"/>
                </div>
                <div className="row">
                    <button type="submit" className="button red">{this.state.loading ? 'LOADING...' : 'UPLOAD'}</button>
                </div>
            </form>
        )
    }
});


module.exports = FileForm;
