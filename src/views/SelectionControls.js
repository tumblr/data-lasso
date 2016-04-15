'use strict';

var _ = require('lodash');
var store = require('../store');
var dispatcher = require('../dispatcher');
var React = require('react');

/**
 * ## Selection View
 *
 * Displays information on currently selected entries
 * and zooming in and out of a dataset
 *
 */

var SelectionControls = React.createClass({
    getInitialState: function() {
        return {
            entriesTotal: store.get('entries').length,
            selectedEntriesTotal: _.filter(store.get('entries'), 'isSelected').length,
            snapshotCount: store.get('snapshots').length,
        }
    },

    componentDidMount: function() {
        store.on('change:selectedEntries', this.onUpdate);
        store.on('change:snapshots', this.onUpdate);
    },

    onUpdate: function() {
        this.setState({
            entriesTotal: store.get('entries').length,
            selectedEntriesTotal: _.filter(store.get('entries'), 'isSelected').length,
            snapshotCount: store.get('snapshots').length,
        });
    },

    zoomOutHandler: function() {
        dispatcher.dispatch({actionType: 'zoom-out'});
    },

    zoomInHandler: function() {
        dispatcher.dispatch({actionType: 'zoom-in'});
    },

    render: function() {
        if (this.state.selectedEntriesTotal || this.state.snapshotCount) {
            return (
                <div className="selection-controls">
                    <div className="selected-indicator">
                        <div className="total">
                            <div className="count-label">Total</div>
                            <div className="count">{this.state.entriesTotal}</div>
                        </div>
                        <div className="selected">
                            <div className="count-label">Selected</div>
                            <div className="count">{this.state.selectedEntriesTotal}</div>
                        </div>
                    </div>

                    <div className="buttons-container">
                        <Button onClick={this.zoomOutHandler} className="back" isActive={this.state.snapshotCount > 0}>◀</Button>
                        <Button onClick={this.zoomInHandler} className="zoom" isActive={this.state.selectedEntriesTotal}>Zoom in</Button>
                    </div>


                    <DownloadButton isActive={this.state.selectedEntriesTotal}>Download selected as csv</DownloadButton>
                </div>
            )
        } else {
            return null;
        }
    },
});

var Button = React.createClass({
    render: function() {
        let classList = ['button', 'black'];
        this.props.className && classList.push(this.props.className);
        classList.push(this.props.isActive ? 'active' : 'disabled');
        return (
            <button onClick={this.props.onClick} className={classList.join(' ')}>{this.props.children}</button>
        )
    }
});

var DownloadButton = React.createClass({
    downloadSelected: function() {
        var csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += _.keys(store.get('attributes')).join(',');

        _.each(store.get('entries'), function (entry, index) {
            if (entry.isSelected) {
                csvContent += _.values(entry).join(',');
                csvContent += (index < store.get('selectedEntries').length) ? '\n' : '';
            }
        }, this);
        window.open(encodeURI(csvContent));
    },

    render: function() {
        if (this.props.isActive) {
            return (
                <div onClick={this.downloadSelected} className="download-link">
                    {this.props.children}
                </div>
            )
        } else {
            return null;
        }
    }
});

module.exports = SelectionControls;
