'use strict';

var _ = require('lodash');
var THREE = require('three');

/**
 * # Frustum
 *
 * Frustum-like structure that consists of four planes describing the selection
 *
 * @param {Vector3} cameraPosition - Current position of the camera
 * @param {[Vector3]} lassoPoints - Array of vectors for every point of lasso selection
 */
class Frustum {
    constructor(cameraPosition, lassoPoints) {
        this.cameraPosition = cameraPosition;
        this.lassoPoints = lassoPoints;
        this.planes = this.createFrustumPlanes();
    }

    /**
     * ## Invert
     *
     * Inverts frustum planes so that their normals are reversed
     */
    invert() {
        this.planes = this.createFrustumPlanes(true);
    }

    /**
     * ## Create Frustum Planes
     *
     * Creates an array of planes that make up the frustum
     *
     * @param {bool} inverse - whether to create planes in reversed order
     */
    createFrustumPlanes (inverse = false) {
        var planes = [];
        if (!inverse) {
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[0], this.cameraPosition, this.lassoPoints[1]));
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[1], this.cameraPosition, this.lassoPoints[2]));
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[2], this.cameraPosition, this.lassoPoints[3]));
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[3], this.cameraPosition, this.lassoPoints[0]));
        } else {
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[1], this.cameraPosition, this.lassoPoints[0]));
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[2], this.cameraPosition, this.lassoPoints[1]));
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[3], this.cameraPosition, this.lassoPoints[2]));
            planes.push(new THREE.Plane().setFromCoplanarPoints(this.lassoPoints[0], this.cameraPosition, this.lassoPoints[3]));
        }
        return planes;
    }

    /**
     * ## Find Entries Inside Frustum
     *
     * Go over the graph's entries and check what is inside the frustum of users's selection
     *
     * @param entries - List of entries to check
     * @returns {Array} of selected entry ids
     */
    findEntriesInsideFrustum (entries) {
        var selected = [];

        _.forEach(entries, (entry) => {
            if (this.isPointInsideFrustum(new THREE.Vector3(entry.x, entry.y, entry.z))) {
                selected.push(entry.__id);
            }
        });

        return selected;
    }

    /**
     * ## Is Point Inside Frustum
     *
     * Check if entry is inside the frustum by checking distance to every frustum plane.
     *
     * Distance from a point to a plain is negative if the point is
     * 'inside' the plane (on the back side of the plane)
     *
     * @param point - Point to check
     */
    isPointInsideFrustum (point) {
        for (var i = 0; i < this.planes.length; i++) {
            var distance = this.planes[i].distanceToPoint(point);

            if (distance > 0) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Frustum;
