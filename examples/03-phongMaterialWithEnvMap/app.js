const dat = require('../vendors/dat.gui.min');
const TweenLite = require('gsap/src/uncompressed/TweenLite');
const Stats = require('stats.js');
const EventEmitter = require('wolfy87-eventemitter');

import { PerspectiveCamera, CameraController } from 'tubugl-camera';
import { CustomSphereCollection } from './components/sphereCollection';
import { PointLight } from '../../src/pointLight';
import { PointLightShape } from './components/pointLightShape';
import { AmbientLight } from '../../src/ambientLight';
import { SkyBox } from './components/skybox';
import { DirectionalLight } from '../../src/directionalLight';
import { DirectionalLightHelper } from '../../src/directionalLightHelper';
import { CubeMapTexture } from './components/cubeMapTexture';

const phongVertexShaderSrc = require('../../src/phongMaterial/shader-vert.glsl');
const phongFragmentShaderSrc = require('../../src/phongMaterial/shader-frag.glsl');

import posXImageURL from '../assets/envmap/posx.jpg';
import negXImageURL from '../assets/envmap/negx.jpg';
import posYImageURL from '../assets/envmap/posy.jpg';
import negYImageURL from '../assets/envmap/negy.jpg';
import posZImageURL from '../assets/envmap/posz.jpg';
import negZImageURL from '../assets/envmap/negz.jpg';

const cubemapImageURLArray = [
	posXImageURL,
	negXImageURL,
	posYImageURL,
	negYImageURL,
	posZImageURL,
	negZImageURL
];

export default class App extends EventEmitter {
	constructor(params = {}) {
		super();
		this._shapes = [];

		this._isMouseDown = false;
		this._isDebug = params.isDebug;
		this._width = params.width ? params.width : window.innerWidth;
		this._height = params.height ? params.height : window.innerHeight;

		this.canvas = document.createElement('canvas');
		this.gl = this.canvas.getContext('webgl');

		this._setParameters();
		this._makeTextures();
		this._makeCamera();
		this._makeCameraController();
		this._makeLight();
		this._makeHelper();
		this._makeSkybox();

		this.resize(this._width, this._height);
	}

	_setParameters() {}

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

		// let meshColorGui = this.gui.addFolder('mesh color');

		let ambientLightFolder = this.gui.addFolder('ambinet light');
		ambientLightFolder.addColor(this._ambientLight, 'lightColor');

		this._directionalLightFolder = this.gui.addFolder('directional light');

		let pointLightFolder = this.gui.addFolder('point light');
		pointLightFolder.addColor(this._pointLight, 'lightColor');
		pointLightFolder.add(this._pointLight, 'decay', 0, 1).step(0.001);
		pointLightFolder.add(this._pointLight, 'distance', 10, 3000);

		let pointLightPositionGui = pointLightFolder.addFolder('position');
		pointLightPositionGui.add(this._pointLight, 'x', -800, 800).listen();
		pointLightPositionGui.add(this._pointLight, 'y', -800, 800).listen();
		pointLightPositionGui.add(this._pointLight, 'z', -1000, 1000).listen();

		this._shapes[0].addGui(this.gui);
	}

	_makeTextures() {
		this._cubemapTexture = new CubeMapTexture(this.gl);
	}
	_updateCubeTexture() {
		let size = 1024;
		this._cubemapTexture
			.bind()
			.fromImages(this._cubeImages, size, size)
			.setFilter();

		// update skybox texture with cubemap texture
		this._skybox.updateTexture(this._cubemapTexture);
	}
	_makeCamera() {
		this._camera = new PerspectiveCamera(window.innerWidth, window.innerHeight, 60, 1, 20000);
		this._camera.position.z = 1200;
		// this._camera.position.x = -800;
		// this._camera.position.y = 400;
		this._camera.lookAt([0, 0, 0]);
	}

	_makeCameraController() {
		this._cameraController = new CameraController(this._camera, this.canvas);
		// this._cameraController.minDistance = 500;
		// this._cameraController.maxDistance = 1500;
	}

	_makeLight() {
		this._pointLight = new PointLight(60, 0, -500, '#ffffff');
		this._pointLightTime = 0;
		this._directionalLight = new DirectionalLight(0, 0, 1, '#999999');
		this._ambientLight = new AmbientLight('#111111');
	}

	_makeDebugLightShape() {
		this._debugPointLightShape = new PointLightShape(this.gl, {}, 10);
		this._debugDirectionalLightShape = new DirectionalLightHelper(
			this.gl,
			{},
			this._directionalLight
		);
		this._debugDirectionalLightShape.addGui(this._directionalLightFolder);
	}

	_makeHelper() {
		// let gridHelper = new GridHelper(this.gl, {}, 1000, 1000, 20, 20);
		this._helpers = [];
	}

	_makeSkybox() {
		this._skybox = new SkyBox(this.gl);
	}

	_makeSphere() {
		let side = 40;

		this._shapes.push(
			new CustomSphereCollection(
				this.gl,
				{
					vertexShaderSrc: phongVertexShaderSrc,
					fragmentShaderSrc: phongFragmentShaderSrc
				},
				side,
				15,
				15
			)
		);
	}

	_onLoadAssetsDone() {
		this.trigger('loadAssetsDone');
		this._updateCubeTexture();
		this._initializeObjects();
	}

	_initializeObjects() {
		this._makeSphere();

		this._initializeObjectDone();
	}

	_initializeObjectDone() {
		this.trigger('initializeObjectDone');
		this._setDebug();

		// this.loop();
	}

	startLoading() {
		// this._onLoadAssetsDone();
		this._cubeImages = [];
		this._loadedCnt = 0;
		cubemapImageURLArray.forEach((cubemapImageUrl, index) => {
			let image = new Image();
			image.onload = () => {
				this._loadedCnt++;
				if (this._loadedCnt == cubemapImageURLArray.length) this._onLoadAssetsDone();
			};
			image.src = cubemapImageUrl;
			this._cubeImages.push(image);
		});
	}

	animateIn() {
		this.isLoop = true;
		TweenLite.ticker.addEventListener('tick', this.loop, this);
	}

	loop() {
		if (this.stats) this.stats.update();

		this._pointLightTime += 1 / 60;
		this._pointLight.z = Math.cos(this._pointLightTime + Math.PI) * 350;
		// this._pointLight.x = Math.cos(this._pointLightTime) * 350;
		// this._pointLight.position.z = Math.cos(this._pointLightTime) * 500;

		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this._camera.update();

		this._shapes.forEach(shape => {
			shape.render(
				this._camera,
				this._ambientLight,
				this._pointLight,
				this._directionalLight,
				this._cubemapTexture
			);
		});
		this._skybox.render(this._camera);

		if (this._debugPointLightShape)
			this._debugPointLightShape.render(this._camera, this._pointLight);
		// if (this._debugDirectionalLightShape) this._debugDirectionalLightShape.render(this._camera);

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

		let pixelRatio = window.devicePixelRatio > 1 ? 1.5 : 1;
		this.canvas.width = parseInt(this._width * pixelRatio);
		this.canvas.height = parseInt(this._height * pixelRatio);
		this.canvas.style.width = `${this._width}px`;
		this.canvas.style.height = `${this._height}px`;

		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

		this._camera.updateSize(this._width, this._height);
	}

	destroy() {}
}
