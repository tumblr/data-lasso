'use strict';

var _ = require('lodash');
var THREE = require('three');

/**
 * ## Axis Geometry
 *
 * Contains functions to make geometry for chart axis and axis legends.
 * Call is as a function to get back a list of meshes.
 *
 */


// Height of the text geometry material
var textGeometryHeight = 1;

// Segments per curve of the legent text geometry
var textCurveSegments = 2;

// Opacity of the legend text
var legendOpacity = 0.9;

// Offset of legend text relative to axis
var legendPositionOffset = 100;

// Color of the axis line, specified as array of R,G,B
var axisLineColor = [0.15, 0.14, 0.21];


var makeAxisTextGeometry = function (mappings, options) {
    var labelMeshes = [];

    _.each(mappings, function (axis, name) {
        var geometry = new THREE.TextGeometry(name + (axis ? ' : ' + axis : ''), {
            size: options.legendSize,
            height: textGeometryHeight,
            curveSegments: textCurveSegments
        });

        var material = new THREE.MeshBasicMaterial({
            color: options.legendColor,
            transparent: true
        });

        material.opacity = legendOpacity;

        var mesh = new THREE.Mesh(geometry, material);

        switch (name) {
            case 'x':
                mesh.rotation.x = -Math.PI / 2;
                mesh.position.x = options.graphSize + legendPositionOffset;
                break;
            case 'y':
                mesh.position.y = options.graphSize + legendPositionOffset;
                break;
            case 'z':
                mesh.rotation.x = -Math.PI / 2;
                mesh.rotation.z = Math.PI / 2;
                mesh.position.z = options.graphSize + legendPositionOffset;
                break;
        }

        labelMeshes.push(mesh);
    }, this);

    return labelMeshes;
};

var makeAxisLinesGeometry = function (options) {
    var size = options.graphSize;

    var vertices = new Float32Array( [
        0, 0, 0,  size, 0, 0,
        0, 0, 0,  0, size, 0,
        0, 0, 0,  0, 0, size
    ] );

    var colors = new Float32Array( [
        axisLineColor[0], axisLineColor[1], axisLineColor[2],   axisLineColor[0], axisLineColor[1], axisLineColor[2],
        axisLineColor[0], axisLineColor[1], axisLineColor[2],   axisLineColor[0], axisLineColor[1], axisLineColor[2],
        axisLineColor[0], axisLineColor[1], axisLineColor[2],   axisLineColor[0], axisLineColor[1], axisLineColor[2]
    ] );

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

    return new THREE.Line(geometry, material);
};

module.exports = function (mappings, options) {
    var meshes = [];

    meshes.push(makeAxisLinesGeometry(options));
    meshes.push(makeAxisTextGeometry(mappings, options));

    return _.flatten(meshes);
};
