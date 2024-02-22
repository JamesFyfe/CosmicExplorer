import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const CosmicExplorer = () => {
  const sun = useRef();
  const mercury = useRef();
  const animationIdRef = useRef(null);
  const composerRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer(); //{ antialias: true }
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setPixelRatio(window.devicePixelRatio);

    // renderer.setClearColor(new THREE.Color(), 0);
    // renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMappingExposure = 5;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.antialias = true;

    let previousTimestamp;

    // Set up scene
    camera.position.z = 10;
    scene.add(new THREE.AmbientLight(0xffffff, 0.02));

    // Load the sun texture
    const textureLoader = new THREE.TextureLoader();
    const sunTexture = textureLoader.load('/images/star_texture_orange.jpeg');
    const mercuryTexture = textureLoader.load('/images/mercury_texture.jpeg');

    const geometry = new THREE.SphereGeometry(1, 80, 40);
    const material = new THREE.MeshBasicMaterial({
      map: sunTexture,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    sun.current = mesh;

    const sunlight = new THREE.PointLight(0xffffff, 10);
    sun.current.add(sunlight);


    const mercuryGeometry = new THREE.SphereGeometry(0.1, 80, 40);
    const mercuryMaterial = new THREE.MeshStandardMaterial({
      map: mercuryTexture,
    });
    const mercuryMesh = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    scene.add(mercuryMesh);
    mercuryMesh.position.set(3, 0, 1);
    mercury.current = mercuryMesh;


    // Set up bloom effect
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1, 1, 0.01);
    const distance = sun.current.position.distanceTo(cameraRef.current.position);
    bloomPass.strength = 0.3 + distance * 0.06;
    

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;
    composerRef.current.setSize(window.innerWidth, window.innerHeight);

    // Set up OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      composerRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    const handleZoomChange = () => {
      // Example: Adjust bloom parameters based on the camera's distance
      const distance = sun.current.position.distanceTo(cameraRef.current.position);
      bloomPass.strength = 0.3 + distance * 0.06;
      composerRef.current.render();
    };

    controls.addEventListener('change', handleZoomChange);

    const animate = (timestamp) => {
      if (!previousTimestamp) {
        previousTimestamp = timestamp;
      }

      const elapsed = timestamp - previousTimestamp;

      // Rotate with a consistent speed regardless of framerate
      // sun.current.rotation.x += 0.0001 * elapsed;
      sun.current.rotation.y += 0.0001 * elapsed;

      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
      // renderer.render(scene, camera);
      composerRef.current.render();
      previousTimestamp = timestamp;

      // Request the next animation frame
      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationIdRef.current = requestAnimationFrame(animate);

    // Clean up on component unmount
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      controls.dispose();
      document.body.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null; // Nothing to render in React
};

export default CosmicExplorer;
