'use strict';

var _ = require('lodash');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var helvetiker = require('three.regular.helvetiker');

var SelectionHelper = require('./helpers/selection');
var axisGeometry = require('./geometry/axis');
var Mouse = require('./helpers/mouse');
var Keyboard = require('./helpers/keyboard');
var vertexShader = require('./shaders/vertex.glsl');
var fragmentShader = require('./shaders/fragment.glsl');
var dotTexture = require('./texture/dot');
var store = require('../store');
var dispatcher = require('../dispatcher');

var StereoEffect = require('three-stereo-effect')(THREE);

/**
 * ## Graph
 *
 * Handles rendering of Data Lasso. That includes:
 * - Scene, camera, lights
 * - Raycasting and collision detection
 * - Rendering
 *
 * When initiated, that class sets up three.js, creates an element to which
 * three.js will render to and returns instance of the class
 */

let graphOptions = {
    id: 'graph-container',

    // Size multiple for hovered points
    pointHoverFactor: 2,

    // Size multiple for selected points
    pointSelectionFactor: 2,
};

var Graph = class Graph {
    constructor(options) {
        _.extend(this, graphOptions);
        this.options = options;

        this.setUpElement();
        this.setUpTHREE();
        this.setUpEventListeners();

        return this;
    }

    setUpElement() {
        this.el = document.createElement('div');
        this.el.id = this.options.id;
    }

    setUpEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        store.on('change:mode change:selectionModifier', this.onModeChange.bind(this));
    }

    onModeChange() {
        var mode = store.get('mode');
        var selectionModifier = store.get('selectionModifier');
        var classList = 'mode-' + mode;

        if (mode === 'selection') {
            if (selectionModifier) {
                classList += '-' + store.get('selectionModifier');
            }
        }

        this.el.classList = classList;
    }

    /**
     * Set up the ground work for THREE.js
     */
    setUpTHREE() {
        THREE.typeface_js.loadFace(helvetiker);

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, this.options.graphSize * 10);
        this.camera.position.set(this.options.graphSize * 2, this.options.graphSize * 2, this.options.graphSize * 2);


        // Mouse vector
        this.mouse = new Mouse(this.el);

        // Keyboard helper
        this.keyboard = new Keyboard();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.renderer.setClearColor(0x32303d, 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.el.appendChild(this.renderer.domElement);

        // Stereo Effect 
        this.stereoEffect = new StereoEffect(this.renderer);
        this.stereoEffect.eyeSeparation = 1;
        this.stereoEffect.setSize(window.innerWidth, window.innerHeight);

        // Orbit Controls
        this.controls = new OrbitControls(this.camera, this.el);
        this.controls.damping = 0.2;
        this.controls.addEventListener('change', _.bind(this.onControlsUpdate, this));
        this.controls.target = new THREE.Vector3(this.options.graphSize / 2, this.options.graphSize / 2, this.options.graphSize / 2);
        store.on('change:controls', () => {
            store.get('controls') ? this.enableControls() : this.disableControls();
        });

        // Lights
        var ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);

        // Materials
        // TODO: Abstract that outside
        var shaderAttributes = {
            size: {type: 'f', value: null},
            customColor: {type: 'c', value: null},
        };
        var shaderUniforms = {
            color: {type: 'c', value: new THREE.Color(0xffffff)},
            texture: {type: 't', value: dotTexture()},
        };
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: shaderUniforms,
            attributes: shaderAttributes,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
        });

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.PointCloud.threshold = 1;

        // Selection
        this.selectionHelper = new SelectionHelper(this.scene, this.camera, this.mouse);

        // Kick off the render loop
        this.animate();

        store.on('change:entries change:mappings change:scales change:attributes change:selectedEntries', _.debounce(_.bind(this.redrawEverything, this)));
    }

    animate() {
        requestAnimationFrame(_.bind(this.animate, this));
        this.renderFrame();
        this.controls.update();
    }

    renderFrame() {
        this.handleRaycasting();
        if(store.options.mode == 'client') {
            this.stereoEffect.render(this.scene, this.camera);
        }
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Event handlers
     */
    redrawEverything() {
        this.data = _.pick(store.toJSON(), ['entries', 'mappings', 'scales', 'attributes']);

        this.updateGeometry();
        this.updateAxisGeometry();
    }

    disableControls() {
        this.controls.noZoom = true;
        this.controls.noRotate = true;
        this.controls.noPan = true;
    }

    enableControls() {
        this.controls.noZoom = false;
        this.controls.noRotate = false;
        this.controls.noPan = false;
    }

    onControlsUpdate() {
        this.renderFrame();
        this.selectionHelper.updateProjectionPlane();
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Raycasting Method
     *
     * Raycasts from the camera position to the mouse position
     * and determines intersections with points.
     */
    handleRaycasting() {
        this.raycaster.setFromCamera(this.mouse.position(), this.camera);

        var intersections = [];

        if (this.pointCloud) {
            intersections = this.raycaster.intersectObjects([this.pointCloud]);

            var size = this.geometry.attributes.size.array;

            _.each(size, (value, index) => {
                if (this.data.entries[index].isSelected) {
                    size[index] = this.pointSize * this.pointSelectionFactor;
                } else {
                    size[index] = this.pointSize;
                }
            });

            if (intersections.length) {
                var entry = this.data.entries[intersections[0].index];

                dispatcher.dispatch({actionType: 'entry-hovered', entry: entry});

                if (entry.isSelected) {
                    size[intersections[0].index] = this.pointSize * this.pointHoverFactor * this.pointSelectionFactor;
                } else {
                    size[intersections[0].index] = this.pointSize * this.pointHoverFactor;
                }
            } else {
                dispatcher.dispatch({actionType: 'entry-hovered', entry: null});
            }

            this.geometry.attributes.size.needsUpdate = true;
        }
    }

    /**
     * Geometry
     */
    updateGeometry() {
        this.updateBufferGeometry();
    }

    /**
     * Update point cloud geometry
     *
     * Point cloud geometry is straight up an array of coordinates for every
     * single point that go directly to the GPU
     */
    updateBufferGeometry() {
        if (this.pointCloud) {
            this.scene.remove(this.pointCloud);
        }

        this.geometry = new THREE.BufferGeometry();

        var positions = new Float32Array(this.data.entries.length * 3);
        var colors = new Float32Array(this.data.entries.length * 3);
        var sizes = new Float32Array(this.data.entries.length);
        var x;
        var y;
        var z;

        var color = new THREE.Color();

        this.pointSize = this.getPointSize();
        this.raycaster.params.PointCloud.threshold = this.pointSize / 2;

        _.each(this.data.entries, (entry, index) => {
            x = this.data.mappings.x ? this.data.scales[this.data.mappings.x](entry[this.data.mappings.x]) : 0;
            y = this.data.mappings.y ? this.data.scales[this.data.mappings.y](entry[this.data.mappings.y]) : 0;
            z = this.data.mappings.z ? this.data.scales[this.data.mappings.z](entry[this.data.mappings.z]) : 0;

            positions[3 * index + 0] = x;
            positions[3 * index + 1] = y;
            positions[3 * index + 2] = z;

            this.data.entries[index].x = x;
            this.data.entries[index].y = y;
            this.data.entries[index].z = z;

            if (entry.isSelected) {
                color.setHSL(0.7, 1, 1);
            } else {
                var hue = this.data.mappings.color ? this.data.scales[this.data.mappings.color](entry[this.data.mappings.color]) / this.options.graphSize * 0.25 : 0.15;
                color.setHSL(hue, 1, 0.5);
            }

            colors[3 * index + 0] = color.r;
            colors[3 * index + 1] = color.g;
            colors[3 * index + 2] = color.b;

            sizes[index] = entry.isSelected ? this.pointSize * this.pointSelectionFactor : this.pointSize;
        });

        this.geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        this.geometry.computeBoundingBox();

        this.pointCloud = new THREE.PointCloud(this.geometry, this.shaderMaterial);

        this.scene.add(this.pointCloud);
    }

    /**
     * Update axis lines and legend geometry
     */
    updateAxisGeometry() {
        if (this.axisMeshes) {
            _.each(this.axisMeshes, (mesh) => {
                this.scene.remove(mesh);
            });
        }

        this.axisMeshes = axisGeometry(this.data.mappings, this.options);
        this.scene.add.apply(this.scene, this.axisMeshes);
    }

    /**
     * Calculate point size based on the size of the
     * graph and amount of entries in data. The bigger the graph,
     * the smaller the point size.
     *
     * @returns {number}
     */
    getPointSize() {
        return Math.pow(this.options.graphSize / Math.log(this.data.entries.length), 2) / 1000;
    }

    remove() {
        window.removeEventListener('resize', _.bind(this.onWindowResize, this));
    }
};

module.exports = Graph;
