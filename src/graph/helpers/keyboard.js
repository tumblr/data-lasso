'use strict';

var dispatcher = require('../../dispatcher');

/**
 * # Keyboard Helper
 *
 * Sets up listeners for keyboard events; contains logic to update
 * store according to those events.
 */

class KeyboardHelper {
    constructor () {
        document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false);
        document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
    }

    onDocumentKeyUp (e) {
        switch (e.keyCode) {
            case 32: // SPACE
                this.startSelectionMode();
                break;

            case 13: // ENTER
            case 27: // ESC
                this.stopSelectionMode();
                break;

            case 16: // SHIFT
                this.stopSelectionModifier();
                break;

            case 18: // ALT
                this.stopSelectionModifier();
                break;
        }
    }

    onDocumentKeyDown (e) {
        switch (e.keyCode) {
            case 16: // SHIFT
                this.startSelectionModifier('add');
                break;

            case 18: // ALT
                this.startSelectionModifier('subtract');
                break;
        }
    }

    startSelectionModifier (modifier) {
        dispatcher.dispatch({
            actionType: 'selection-modifier-changed',
            selectionModifier: modifier,
        });
    }

    stopSelectionModifier () {
        dispatcher.dispatch({
            actionType: 'selection-modifier-changed',
            selectionModifier: null,
        });
    }

    startSelectionMode () {
        dispatcher.dispatch({
            actionType: 'mode-changed',
            mode: 'selection',
        });
    }

    stopSelectionMode () {
        dispatcher.dispatch({
            actionType: 'mode-changed',
            mode: 'view',
        });
    }
}

module.exports = KeyboardHelper;
