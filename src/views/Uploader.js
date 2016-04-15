'use strict';

var d3 = require('d3');
var store = require('../store');
var dispatcher = require('../dispatcher');
var React = require('react');

/**
 * ## Upload Form View
 *
 * Handles UI and logic of loading data into Data Lasso
 * either using file or by requesting dataset from a URL
 */

const Uploader = React.createClass({
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

    loadData: function(data, callback) {
        if (data) {
            var entries = this.parseFile(data);

            if (entries) {
                store.once('change:entries', () => {
                    callback();
                });
                dispatcher.dispatch({actionType: 'file-uploaded', entries: entries});
            } else {
                callback('No entries in the data');
            }
        } else {
            callback('Data to load is empty');
        }
    },

    parseFile: function (data) {
        try {
            switch (this.state.type) {
                case 'csv':
                    return d3.csv.parse(data);
                case 'tsv':
                    return d3.tsv.parse(data);
                case 'json':
                    return JSON.parse(data);
            }
        } catch (e) {
            this.displayError();
            return null
        }
    },

    render: function() {
        let form = this.state.source === 'file' ? (<FileForm loadData={this.loadData}/>) : (<UrlForm loadData={this.loadData}/>);
        return (
            <div className='uploader'>
                <Toggles source={this.state.source} type={this.state.type} />
                {form}
            </div>
        )
    }
});


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

const FileForm = React.createClass({
    getInitialState: function() {
        return {
            loading: false,
            error: false,
        }
    },

    submitHandler: function(e) {
        e.preventDefault();
        this.setState({loading: true});

        var file = e.target[0].files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = (e) => {
                this.props.loadData(e.target.result, this.onDataLoadComplete);
            };
            reader.readAsText(file);
        }
    },

    onDataLoadComplete: function(error) {
        this.setState({
            loading: false,
            error: error,
        });
    },

    render: function() {
        let inputStyle = {
            border: this.state.error ? '1px solid red' : ''
        };
        return (
            <form onSubmit={this.submitHandler} className="file-upload-form">
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

const UrlForm = React.createClass({
    getInitialState: function() {
        return {
            loading: false,
            error: false,
        }
    },

    submitHandler: function(e) {
        e.preventDefault();
        var url = e.target[0].value;
        if (url) {
            this.setState({loading: true});
            $.get(url)
                .then((data) => {this.props.loadData(data, this.onDataLoadComplete)})
                .fail((jqXHR, status, error) => {this.onDataLoadComplete(status === 'error')});
        }
    },

    onDataLoadComplete: function(error) {
        this.setState({
            loading: false,
            error: error,
        });
    },

    render: function() {
        let inputStyle = {
            border: this.state.error ? '1px solid red' : ''
        };
        return (
            <form onSubmit={this.submitHandler} className="url-form">
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
