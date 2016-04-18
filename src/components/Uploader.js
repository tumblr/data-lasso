'use strict';

var d3 = require('d3');
var store = require('../store');
var dispatcher = require('../dispatcher');
var React = require('react');

/**
 * ## Upload Form Component
 *
 * Handles UI and logic of loading data into Data Lasso
 * either using file or by requesting dataset from a URL
 */
var Uploader = React.createClass({
    getInitialState: function() {
        return {
            source: store.get('source'),
            type: store.get('type'),
        };
    },

    componentDidMount: function() {
        store.on('change:source', () => {this.setState({source: store.get('source')})});
        store.on('change:type', () => {this.setState({type: store.get('type')})});
    },

    /**
     * Handles incoming data either from file uploader form or from
     * URL form
     *
     * @param {string} data - Data as a string, coming from file or URL forms
     * @param {fn} callback - Callback function for when data was loaded
     */
    handleDataLoad: function(data, callback) {
        if (data) {
            var parsedData;

            try {
                parsedData = this.parseFile(data);
            } catch (e) {
                callback('Error parsing incoming data');
            }

            if (parsedData) {
                store.once('change:entries', () => {
                    callback();
                });
                dispatcher.dispatch({actionType: 'file-uploaded', entries: parsedData});
            } else {
                callback('No entries in the data');
            }
        } else {
            callback('Data to load is empty');
        }
    },

    /**
     * Parses incoming data from a string to an object based on the file type provided
     * @param {string} data - Data as a string, coming from file or URL forms
     * @returns {object} - Parsed data
     */
    parseFile: function (data) {
        switch (this.state.type) {
            case 'csv':
                return d3.csv.parse(data);
            case 'tsv':
                return d3.tsv.parse(data);
            case 'json':
                return JSON.parse(data);
        }
    },

    /**
     * Renders Uploader UI, with either file upload form, or URL upload form
     */
    render: function() {
        let form = this.state.source === 'file' ? (<FileForm handleDataLoad={this.handleDataLoad}/>) : (<UrlForm handleDataLoad={this.handleDataLoad}/>);
        return (
            <div className='uploader'>
                <Toggles source={this.state.source} type={this.state.type} />
                {form}
            </div>
        )
    }
});

/**
 * ## Toggles React component
 *
 * Renders a set of toggles that are used in the Uploader
 */
const Toggles = React.createClass({
    handleSourceChange: function(newSource) {
        dispatcher.dispatch({
            actionType: 'source-change',
            source: newSource,
        });
    },

    handleTypeChange: function(newType) {
        dispatcher.dispatch({
            actionType: 'type-change',
            type: newType,
        });
    },

    render: function() {
        return (
            <div>
                <div className="row">DATA SOURCE</div>

                <div className="row extra-spacing">
                    <div className="column">
                        <Toggle onClick={this.handleSourceChange.bind(this, 'file')} isActive={this.props.source === 'file'}>FILE</Toggle>
                    </div>
                    <div className="column">
                        <Toggle onClick={this.handleSourceChange.bind(this, 'url')} isActive={this.props.source === 'url'}>URL</Toggle>
                    </div>
                </div>

                <div className="row extra-spacing">
                    <div className="column">
                        <Toggle onClick={this.handleTypeChange.bind(this, 'csv')} isActive={this.props.type === 'csv'}>CSV</Toggle>
                    </div>
                    <div className="column">
                        <Toggle onClick={this.handleTypeChange.bind(this, 'tsv')} isActive={this.props.type === 'tsv'}>TSV</Toggle>
                    </div>
                    <div className="column">
                        <Toggle onClick={this.handleTypeChange.bind(this, 'json')} isActive={this.props.type === 'json'}>JSON</Toggle>
                    </div>
                </div>
            </div>
        )
    }
});

/**
 * ## Toggle React component
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

/**
 * ## File Form React component
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

/**
 * ## Url Upload Form React component
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

        var url = e.target[0].value;
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
        let inputStyle = {
            border: this.state.error ? '1px solid red' : '',
        };
        return (
            <form onSubmit={this.handleFormSubmission} className="url-form">
                <div>
                    <input style={inputStyle} type="text" placeholder="URL to a file" className="text-input url-input"/>
                </div>
                <div className="row">
                    <button className="button red">{this.state.loading ? 'LOADING...' : 'UPLOAD'}</button>
                </div>
            </form>
        )
    }
});

module.exports = Uploader;
