'use strict';

var React = require('react');

var Uploader = require('./Uploader');
var AxisControls = require('./AxisControls');
var Hud = require('./Hud');
var ModeIndicator = require('./ModeIndicator');
var SelectionControls = require('./SelectionControls');


/**
 * # Data Lasso React component
 *
 * Wrapper component for Data Lasso UI which
 * initializes rest of the UI
 */

var DataLassoUI = React.createClass({
    render: function() {
        return (
            <div>
                <Uploader/>
                <AxisControls/>
                <Hud/>
                <ModeIndicator/>
                <SelectionControls/>
            </div>
        )
    }
});

module.exports = DataLassoUI;
