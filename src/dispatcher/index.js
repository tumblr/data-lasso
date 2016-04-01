'use strict';

/**
 * # Dispatcher
 *
 * This is a dispatcher for Data Lasso, as in Dispatcher from Flux pattern.
 * It's task is to accept dispatched events and pass them to registered callbacks.
 */

var Dispatcher = require('flux').Dispatcher;

module.exports = new Dispatcher();
