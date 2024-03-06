import * as THREE from 'three';
import OrbitData from './OrbitData.js'
import Ring from './Ring.js'

export default class CelestialBody {
  constructor({name, mass, radius, color, texturePath, startingPosition = { x: 0, y: 0, z: 0 }, rotationPeriod = 0, startingRotation = 0, axisTilt = 0, orbitData = null, lightIntensity = 0, basicMat = false, ringData, atmosphereOpacity, children = [], parent = null }) {
		this.name = name;
		this.container = new THREE.Object3D();
		this.mass = mass;
		this.color = color;
		this.radius = radius;
		this.rotationPeriod = rotationPeriod;
		this.startingRotation = startingRotation * Math.PI / 180;
    const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load(texturePath);
		const material = basicMat ? new THREE.MeshStandardMaterial({ 
			emissive: "rgb(160, 160, 90)",
			emissiveMap: texture,
			emissiveIntensity: 3
		}) : new THREE.MeshStandardMaterial({ map: texture });
		const geometry = new THREE.SphereGeometry(radius, 80, 40);
		this.mesh = new THREE.Mesh(geometry, material);
		this.container.position.set(Math.random() * 5000, Math.random() * 5000, Math.random() * 5000);
		this.orbitData = orbitData;
		this.orbitEllipse = null;
		this.parent = parent;

		if (lightIntensity > 0) {
			const light = new THREE.PointLight(0xffffff, lightIntensity);
			this.mesh.add(light);
		}

		if(orbitData != null) {
			this.orbitEllipse = this.orbitData.createOrbitEllipse();
			this.orbitEllipse.material.color.set(this.color);
			parent.container.add(this.orbitEllipse);
		}

		if(this.name == "Earth") {
			this.addNightLights();
			this.addClouds();
		}
		if(atmosphereOpacity > 0) {
			this.atmosphereOpacity = atmosphereOpacity;
			this.addAtmosphere();
		}
		
		let tilt = axisTilt * Math.PI / 180;
		if(this.orbitData != null) {
			// subtract inclination from tilt since tilt is relative to inclination
			tilt -= this.orbitData.inclination;
		}
		this.mesh.rotation.x = -tilt;
		this.container.add(this.mesh);

		if(ringData != null) {
			let ring = new Ring(ringData);
			this.mesh.add(ring.mesh);
			this.ring = ring;
		}

		this.indicator = this.createIndicator();
		this.container.add(this.indicator);

		this.children = [];
		if(children.length !== 0) {
			children.forEach((child) => {
				let childBody = new CelestialBody({
					name: child.name,
					mass: child.mass, 
					radius: child.radius, 
					color: child.color, 
					texturePath: child.texturePath, 
					startingPosition: child.startingPosition,
					rotationPeriod: child.rotationPeriod, 
					startingRotation: child.startingRotation, 
					axisTilt: child.axisTilt, 
					orbitData: new OrbitData(child.orbitData), 
					lightIntensity: child.ightIntensity, 
					basicMat: child.basicMat,
					ringData: child.ringData,
					atmosphereOpacity: child.atmosphereOpacity,
					children: child.children, 
					parent: this,
				});
				this.children.push(childBody);
				this.container.add(childBody.container);
			});
		}
  }

  update(date, camera) {
		if(this.rotationPeriod != 0) {
			// 3.6e+6 ms per hour
			this.mesh.rotation.y = this.startingRotation + ((date / 3.6e+6) / this.rotationPeriod) * 2 * Math.PI;
		}
		if(this.orbitData != null) {
			const position = this.orbitData.calculateEllipticalOrbitPosition(date);
			this.container.position.set(...position.toArray());
		}

		// Apply scale to indicator to maintain constant size on the screen
		let worldPos = new THREE.Vector3();
		this.container.getWorldPosition(worldPos);
		const distance = worldPos.distanceTo(camera.position);
		const scaleFactor = distance / 5000;
		this.indicator.scale.set(scaleFactor, scaleFactor, scaleFactor);
		this.indicator.lookAt(camera.position);
		if(this.name == "Earth") {
			// Move clouds slowly
			this.mesh.children[1].rotateY(0.00001);
		}
  }

	createIndicator() {
		const indicatorGeometry = new THREE.RingGeometry(90, 100);
		const indicatorMaterial = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.8, side: THREE.DoubleSide});
		const indicatorMesh = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
		indicatorMesh.position.copy(this.mesh.position);
		return indicatorMesh
	}

	addNightLights() {
		const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load("/images/earth_lights.png");
		const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, color: 0x999999 });
		const geometry = new THREE.SphereGeometry(this.radius + 0.0001, 80, 40);
		const mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(mesh);
	}

	addClouds() {
		const textureLoader = new THREE.TextureLoader();
		const texture2 = textureLoader.load("/images/earth_clouds.png");
		const material2 = new THREE.MeshStandardMaterial({ map: texture2, transparent: true });
		const geometry2 = new THREE.SphereGeometry(this.radius + 0.03, 80, 40);
		const mesh2 = new THREE.Mesh(geometry2, material2);
		this.mesh.add(mesh2);
	}

	addAtmosphere() {
		const material = new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: this.atmosphereOpacity });
		const scaleFactor = 1.005;

		let geometry = new THREE.SphereGeometry(this.radius + 0.05, 80, 40);
		let mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(mesh);

		geometry = geometry.clone().scale(scaleFactor, scaleFactor, scaleFactor);
		mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(mesh);

		geometry = geometry.clone().scale(scaleFactor, scaleFactor, scaleFactor);
		mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(mesh);

		geometry = geometry.clone().scale(scaleFactor, scaleFactor, scaleFactor);
		mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(mesh);

		geometry = geometry.clone().scale(scaleFactor, scaleFactor, scaleFactor);
		mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(mesh);
	}
}
