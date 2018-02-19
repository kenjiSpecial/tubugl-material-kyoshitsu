const dat = require('../vendors/dat.gui.min');
const TweenLite = require('gsap/src/uncompressed/TweenLite');
const Stats = require('stats.js');
const EventEmitter = require('wolfy87-eventemitter');
const chroma = require('chroma-js');

import { GridHelper } from 'tubugl-helper';
import { PerspectiveCamera, CameraController } from 'tubugl-camera';
import { ModelObject } from './components/object';
import { CustomSphere, CustomCube } from './components/customShape';
import { PointLight } from '../../src/pointLight';
import { PointLightShape } from './components/pointLightShape';

const baseVertexShaderSrc = require('./components/shaders/shader-vert.glsl');
const baseFragmentShaderSrc = require('./components/shaders/shader-frag.glsl');

const phongVertexShaderSrc = require('../../src/old/phongMaterial/shader-vert.glsl');
const phongFragmentShaderSrc = require('../../src/old/phongMaterial/shader-frag.glsl');

export default class App extends EventEmitter {
	constructor(params = {}) {
		super();
		this._isMouseDown = false;
		this._isDebug = params.isDebug;
		this._width = params.width ? params.width : window.innerWidth;
		this._height = params.height ? params.height : window.innerHeight;

		this.canvas = document.createElement('canvas');
		this.gl = this.canvas.getContext('webgl');

		this._setParameters();
		this._makeCamera();
		this._makeCameraController();
		this._makeLight();
		this._makeHelper();

		this.resize(this._width, this._height);
	}

	_setParameters() {
		this._ambientColor = '#000066';
		this._diffuseColor = '#cccc00';
		this._specularColor = '#dddddd';

		this._distance = 800;
		this._lightPower = 1;

		this._updateColor();
	}

	_setDebug() {
		if (this._isDebug) {
			this.stats = new Stats();
			document.body.appendChild(this.stats.dom);
			this._addGui();
			this._makeDebugLightShape();
		} else {
			let descId = document.getElementById('tubugl-desc');
			descId.style.display = 'none';
		}
	}

	_addGui() {
		this.gui = new dat.GUI();
		this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');

		let meshColorGui = this.gui.addFolder('mesh color');
		meshColorGui
			.addColor(this, '_ambientColor')
			.name('ambientColor')
			.onChange(() => {
				this._updateColor();
			});

		meshColorGui
			.addColor(this, '_diffuseColor')
			.name('diffuseColor')
			.onChange(() => {
				this._updateColor();
			});
		meshColorGui
			.addColor(this, '_specularColor')
			.name('specularColor')
			.onChange(() => {
				this._updateColor();
			});

		let pointLightFolder = this.gui.addFolder('point light');
		pointLightFolder.addColor(this._pointLight, 'lightColor');
		pointLightFolder.add(this._pointLight, 'shininess', 1, 100);
		pointLightFolder.add(this._pointLight, 'lightPower', 10, 300);

		let pointLightPositionGui = pointLightFolder.addFolder('position');
		pointLightPositionGui.add(this._pointLight, 'x', -800, 800);
		pointLightPositionGui.add(this._pointLight, 'y', -800, 800);
		pointLightPositionGui.add(this._pointLight, 'z', -1000, 1000);
	}

	_updateColor() {
		this._glAmbientColor = chroma(this._ambientColor).gl();
		this._glDiffuseColor = chroma(this._diffuseColor).gl();
		this._glSpecularColor = chroma(this._specularColor).gl();
	}

	_makeCamera() {
		this._camera = new PerspectiveCamera(window.innerWidth, window.innerHeight, 60, 1, 2000);
		this._camera.position.z = 800;
		this._camera.position.x = -800;
		this._camera.position.y = 400;
		this._camera.lookAt([0, 0, 0]);
	}

	_makeCameraController() {
		this._cameraController = new CameraController(this._camera, this.canvas);
		this._cameraController.minDistance = 500;
		this._cameraController.maxDistance = 1500;
	}

	_makeLight() {
		this._pointLight = new PointLight(0, 0, 400, 20, '#ffffff', 150);
	}

	_makeDebugLightShape() {
		this._debugPointLightShape = new PointLightShape(this.gl);
	}

	_makeHelper() {
		let gridHelper = new GridHelper(this.gl, {}, 1000, 1000, 20, 20);
		this._helpers = [gridHelper];
	}

	_makeObject() {
		this._materialBallObject = new ModelObject(
			this.gl,
			{
				vertexShaderSrc: phongVertexShaderSrc,
				fragmentShaderSrc: phongFragmentShaderSrc
			},
			this._materaialBallData
		);
		this._shapes.push(this._materialBallObject);
	}

	_makeSphere() {
		let side = 100;
		this._sphere = new CustomSphere(
			this.gl,
			{
				vertexShaderSrc: phongVertexShaderSrc,
				fragmentShaderSrc: phongFragmentShaderSrc
			},
			side,
			15,
			15
		);
		this._sphere.position.y = side;
		this._sphere.position.x = side + side * 2;

		this._shapes.push(this._sphere);
	}

	_makeBox() {
		let side = 200;

		this._box = new CustomCube(
			this.gl,
			{
				vertexShaderSrc: phongVertexShaderSrc,
				fragmentShaderSrc: phongFragmentShaderSrc
			},
			side,
			side,
			side,
			4,
			4,
			4
		);

		this._box.position.y = side / 2;
		this._box.position.x = -side / 2 - side;

		this._shapes.push(this._box);
	}

	_onLoadAssetsDone() {
		this.trigger('loadAssetsDone');
		this._initializeObjects();
	}

	_initializeObjects() {
		this._shapes = [];

		this._makeObject();
		this._makeBox();
		this._makeSphere();

		this._initializeObjectDone();
	}

	_initializeObjectDone() {
		this.trigger('initializeObjectDone');
		this._setDebug();
	}

	startLoading() {
		this._materaialBallData = require('../assets/material-ball.json');
		this._onLoadAssetsDone();
	}

	animateIn() {
		this.isLoop = true;
		TweenLite.ticker.addEventListener('tick', this.loop, this);
	}

	loop() {
		if (this.stats) this.stats.update();

		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this._camera.update();

		this._shapes.forEach(shape => {
			shape.render(
				this._camera,
				{
					glAmbientColor: this._glAmbientColor,
					glDiffuseColor: this._glDiffuseColor,
					glSpecularColor: this._glSpecularColor
				},
				this._pointLight
			);
		});

		if (this._debugPointLightShape)
			this._debugPointLightShape.render(this._camera, this._pointLight);

		this._helpers.forEach(helper => {
			helper.render(this._camera);
		});
	}

	animateOut() {
		TweenLite.ticker.removeEventListener('tick', this.loop, this);
	}

	mouseMoveHandler(mouse) {
		if (!this._isMouseDown) return;

		this._prevMouse = mouse;
	}

	mouseDownHandler(mouse) {
		this._isMouseDown = true;
		this._prevMouse = mouse;
	}

	mouseupHandler() {
		this._isMouseDown = false;
	}

	onKeyDown(ev) {
		switch (ev.which) {
			case 27:
				this._playAndStop();
				break;
		}
	}

	_playAndStop() {
		this.isLoop = !this.isLoop;
		if (this.isLoop) {
			TweenLite.ticker.addEventListener('tick', this.loop, this);
			this.playAndStopGui.name('pause');
		} else {
			TweenLite.ticker.removeEventListener('tick', this.loop, this);
			this.playAndStopGui.name('play');
		}
	}

	resize(width, height) {
		this._width = width;
		this._height = height;

		this.canvas.width = this._width;
		this.canvas.height = this._height;
		this.gl.viewport(0, 0, this._width, this._height);

		this._camera.updateSize(this._width, this._height);
	}

	destroy() {}
}
