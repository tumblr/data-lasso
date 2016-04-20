'use strict';

var _ = require('lodash');
var store = require('../../store');
var dispatcher = require('../../dispatcher');
var React = require('react');

/**
 * ## Selection UI Component
 *
 * Displays information on currently selected entries and zooming in and out of a dataset
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
        store.on('change:selectedEntries', this.handleDataUpdate);
        store.on('change:snapshots', this.handleDataUpdate);
    },

    /**
     * Update internal state when selection or snapshots change
     */
    handleDataUpdate: function() {
        this.setState({
            entriesTotal: store.get('entries').length,
            selectedEntriesTotal: _.filter(store.get('entries'), 'isSelected').length,
            snapshotCount: store.get('snapshots').length,
        });
    },

    handleZoomOutClick: function() {
        dispatcher.dispatch({actionType: 'zoom-out'});
    },

    handleZoomInClick: function() {
        dispatcher.dispatch({actionType: 'zoom-in'});
    },

    /**
     * Renders the selection UI if something is selected, or zooming was performed earlier
     */
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
                        <ZoomControlButton onClick={this.handleZoomOutClick} className="back" isActive={this.state.snapshotCount > 0}>◀</ZoomControlButton>
                        <ZoomControlButton onClick={this.handleZoomInClick} className="zoom" isActive={this.state.selectedEntriesTotal > 0}>Zoom in</ZoomControlButton>
                    </div>


                    <DownloadButton isActive={this.state.selectedEntriesTotal}>Download selected as csv</DownloadButton>
                </div>
            )
        } else {
            return null;
        }
    },
});

/**
 * ## Zoom Control button helper React component
 *
 * Buttons that control zoom
 */
var ZoomControlButton = React.createClass({
    propTypes: {
        onClick: React.PropTypes.func,
        isActive: React.PropTypes.bool,
    },

    render: function() {
        let classList = ['button', 'black'];
        this.props.className && classList.push(this.props.className);
        classList.push(this.props.isActive ? 'active' : 'disabled');
        return (
            <button onClick={this.props.onClick} className={classList.join(' ')}>{this.props.children}</button>
        )
    }
});

/**
 * ## Selection Download button helper React component
 *
 * Renders button for downloading selection as a CSV. Also handles generating that CSV and opening it
 * for download
 */
var DownloadButton = React.createClass({
    downloadSelected: function() {
        var csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += _.keys(store.get('attributes')).join(',');

        _.forEach(store.get('entries'), function (entry, index) {
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
