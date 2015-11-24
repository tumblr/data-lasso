'use strict';

var _ = require('lodash');
var Backbone = require('backbone');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var helvetiker = require('three.regular.helvetiker');
var events = require('../lib/events');
var SelectionHelper = require('../helpers/selection');
var axisGeometry = require('../geometry/axis');
var mouseVectorHelper = require('../helpers/mousevector');
var shaders = require('../templates/shaders.tpl');
var textures = require('../helpers/texture');


/**
 * ## Graph View
 *
 * The view that handles rendering Data Lasso. That includes:
 * - Scene, camera, lights
 * - Raycasting and collision detection
 * - Rendering
 *
 */

var GraphView = Backbone.View.extend({

    id: 'graph-container',

    // Size multiple for hovered points
    pointHoverFactor: 2,

    // Size multiple for selected points
    pointSelectionFactor: 2,

    initialize: function (options) {
        this.options = options;

        window.addEventListener('resize', _.bind(this.onWindowResize, this));
    },

    /**
     * Set up the ground work for THREE.js
     */
    setUpTHREE: function () {
        THREE.typeface_js.loadFace(helvetiker);

        this.$el.append(shaders());

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, this.options.graphSize * 10);
        this.camera.position.set(this.options.graphSize*2, this.options.graphSize*2, this.options.graphSize*2);

        // Mouse vector
        this.mouse = mouseVectorHelper(this.$el);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.renderer.setClearColor(0x32303d, 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.$el[0].appendChild(this.renderer.domElement);

        // Orbit Controls
        this.controls = new OrbitControls(this.camera, this.$el[0]);
        this.controls.damping = 0.2;
        this.controls.addEventListener('change', _.bind(this.onControlsUpdate, this));
        this.controls.target = new THREE.Vector3(this.options.graphSize/2, this.options.graphSize/2, this.options.graphSize/2);
        this.listenTo(events, 'datalasso:controls:off', this.disableControls);
        this.listenTo(events, 'datalasso:controls:on', this.enableControls);

        // Lights
        var ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);

        // Materials
        // TODO: Abstract that outside
        var shaderAttributes = {
            size: {type: 'f', value: null },
            customColor: {type: 'c', value: null }
        };
        var shaderUniforms = {
            color: {type: 'c', value: new THREE.Color( 0xffffff )},
            texture: {type: 't', value: textures.dotTexture()}
        };
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms:       shaderUniforms,
            attributes:     shaderAttributes,

            vertexShader:   this.$('#vertexshader')[0].textContent,
            fragmentShader: this.$('#fragmentshader')[0].textContent,

            blending:       THREE.AdditiveBlending,
            depthTest:      false,
            transparent:    true
        });

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.PointCloud.threshold = 1;

        // Selection
        this.selectionHelper = new SelectionHelper(this.scene, this.camera);

        // Kick off the render loop
        this.animate();

        this.listenTo(events, 'datalasso:data:new', this.redrawEverything);
    },

    animate: function () {
        requestAnimationFrame(_.bind(this.animate, this));
        this.renderFrame();
        this.controls.update();
    },

    renderFrame: function () {
        this.handleRaycasting();
        this.renderer.render(this.scene, this.camera);
    },

    /**
     * Event handlers
     */

    redrawEverything: function (e) {
        this.data = e.data;

        this.updateGeometry();
        this.updateAxisGeometry();
    },

    redrawPoints: function (e) {
        this.data.entries = e.entries;

        this.updateGeometry();
    },

    disableControls: function () {
        this.controls.noZoom = true;
        this.controls.noRotate = true;
        this.controls.noPan = true;
    },

    enableControls: function () {
        this.controls.noZoom = false;
        this.controls.noRotate = false;
        this.controls.noPan = false;
    },

    onControlsUpdate: function () {
        this.renderFrame();
        events.trigger('datalasso:camera:moved');
    },

    onWindowResize: function () {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix()
    },

    /**
     * Raycasting Method
     *
     * Raycasts from the camera position to the mouse position
     * and determines intersections with points.
     */
    handleRaycasting: function () {
        this.raycaster.setFromCamera(this.mouse.position(), this.camera);

        var intersections = [];

        if (this.pointCloud) {
            intersections = this.raycaster.intersectObjects([this.pointCloud]);

            var size = this.geometry.attributes.size.array;

            _.each(size, function (value, index) {
                if (this.data.entries[index].isSelected) {
                    size[index] = this.pointSize * this.pointSelectionFactor;
                } else {
                    size[index] = this.pointSize;
                }
            }, this);

            if (intersections.length) {
                var entry = this.data.entries[intersections[0].index];

                events.trigger('datalasso:hud:update', entry);

                if (entry.isSelected) {
                    size[intersections[0].index] = this.pointSize * this.pointHoverFactor * this.pointSelectionFactor;
                } else {
                    size[intersections[0].index] = this.pointSize * this.pointHoverFactor;
                }
            } else {
                events.trigger('datalasso:hud:update');
            }

            this.geometry.attributes.size.needsUpdate = true;
        }
    },

    /**
     * Geometry
     */
    updateGeometry: function () {
        this.updateBufferGeometry();
    },

    /**
     * Update point cloud geometry
     *
     * Point cloud geometry is straight up an array of coordinates for every
     * single point that go directly to the GPU
     */
    updateBufferGeometry: function () {
        if (this.pointCloud) {
            this.scene.remove(this.pointCloud);
        }

        this.geometry = new THREE.BufferGeometry();

        var positions = new Float32Array(this.data.entries.length * 3);
        var colors = new Float32Array(this.data.entries.length * 3 );
        var sizes = new Float32Array(this.data.entries.length);
        var x;
        var y;
        var z;

        var color = new THREE.Color();

        this.pointSize = this.getPointSize();
        this.raycaster.params.PointCloud.threshold = this.pointSize / 2;

        _.each(this.data.entries, function (entry, index) {
            x = this.data.mappings.x.attribute ? this.data.scales[this.data.mappings.x.attribute](entry[this.data.mappings.x.attribute]) : 0;
            y = this.data.mappings.y.attribute ? this.data.scales[this.data.mappings.y.attribute](entry[this.data.mappings.y.attribute]) : 0;
            z = this.data.mappings.z.attribute ? this.data.scales[this.data.mappings.z.attribute](entry[this.data.mappings.z.attribute]) : 0;

            positions[3 * index + 0] = x;
            positions[3 * index + 1] = y;
            positions[3 * index + 2] = z;

            this.data.entries[index].x = x;
            this.data.entries[index].y = y;
            this.data.entries[index].z = z;

            if (entry.isSelected) {
                color.setHSL(0.7, 1, 1);
            } else {
                var hue = this.data.mappings.color.attribute ? this.data.scales[this.data.mappings.color.attribute](entry[this.data.mappings.color.attribute]) / this.options.graphSize * 0.25 : 0.15;
                color.setHSL(hue, 1, 0.5);
            }

            colors[3 * index + 0] = color.r;
            colors[3 * index + 1] = color.g;
            colors[3 * index + 2] = color.b;

            sizes[index] = entry.isSelected ? this.pointSize * this.pointSelectionFactor : this.pointSize;
        }, this);

        this.geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        this.geometry.computeBoundingBox();

        this.pointCloud = new THREE.PointCloud(this.geometry, this.shaderMaterial);

        this.scene.add(this.pointCloud);
    },

    /**
     * Update axis lines and legend geometry
     */
    updateAxisGeometry: function () {
        if (this.axisMeshes) {
            _.each(this.axisMeshes, function removeAxisMesh(mesh) {
                this.scene.remove(mesh);
            }, this);
        }

        /**************************** DOWN HERE ****/
        this.axisMeshes = axisGeometry(this.data.mappings, this.options);

        this.scene.add.apply(this.scene, this.axisMeshes);
    },

    /**
     * Calculate point size based on the size of the
     * graph and amount of entries in data. The bigger the graph,
     * the smaller the point size.
     *
     * @returns {number}
     */
    getPointSize: function () {
        return Math.pow(this.options.graphSize / Math.log(this.data.entries.length), 2) / 1000;
    },

    render: function () {
        this.setUpTHREE();

        return this;
    },

    remove: function () {
        window.removeEventListener('resize', _.bind(this.onWindowResize, this));
    }
});

module.exports = GraphView;
