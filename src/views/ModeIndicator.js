'use strict';

var React = require('react');
var store = require('../store');

/**
 * ## Mode Indicator View
 *
 * Handles visual feedback when mode is changed
 * between normal mode and selection mode.
 *
 */

var ModeIndicator = React.createClass({
    getInitialState: function() {
        return {
            mode: store.get('mode'),
        }
    },

    componentDidMount: function() {
        store.on('change:mode', () => {
            this.setState({
                mode: store.get('mode'),
            })
        });
    },

    getCopyForMode: function(mode) {
        switch (mode) {
            case 'normal':
                return {
                    header: 'View mode',
                    hint: '(SPACEBAR for selection mode)',
                };
            case 'selection':
                return {
                    header: 'Selection mode',
                    hint: '(ESC for view mode, LMB to select a 4-point rectangle)',
                };
        }
    },

    render: function() {
        let copy = this.getCopyForMode(this.state.mode);
        return (
            <div className="mode-indicator">
                <div className={this.state.mode + '-mode'}>
                    <strong>{copy.header}</strong>
                    <small>{copy.hint}</small>
                </div>
            </div>
        )
    }
});

module.exports = ModeIndicator;
