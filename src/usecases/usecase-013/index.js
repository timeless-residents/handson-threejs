import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase013 extends UseCaseBase {
  static metadata = {
    id: "013",
    title: "Wave Animation Grid",
    description: "Grid of cubes animating in a wave pattern",
    categories: ["Geometry", "Animation", "Grid"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
  }

  static setupScene(scene) {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const objects = [];
    const geometries = [];
    const gridSize = 10;
    const spacing = 1.2;

    // Create cube geometry (reused for all cubes)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometries.push(geometry);

    // Create grid of cubes
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(x / gridSize, 0.7, 0.5),
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = (x - gridSize / 2) * spacing;
        cube.position.z = (z - gridSize / 2) * spacing;
        scene.add(cube);
        objects.push(cube);
      }
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    const gridSize = Math.sqrt(objects.length);
    objects.forEach((cube, index) => {
      const x = Math.floor(index / gridSize);
      const z = index % gridSize;

      // Wave animation
      const distance = Math.sqrt(x * x + z * z);
      const offset = distance * 0.5;
      cube.position.y = Math.sin(time * 2 + offset) * 0.5;

      // Rotation
      cube.rotation.x = Math.sin(time + offset) * 0.3;
      cube.rotation.z = Math.cos(time + offset) * 0.3;

      // Color animation
      cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase013.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase013.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [10, 10, 10],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // Create a simple SVG representation of a grid of cubes in a wave pattern
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Rainbow gradient for color transitions -->
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff0000"/>
            <stop offset="20%" stop-color="#ffff00"/>
            <stop offset="40%" stop-color="#00ff00"/>
            <stop offset="60%" stop-color="#00ffff"/>
            <stop offset="80%" stop-color="#0000ff"/>
            <stop offset="100%" stop-color="#ff00ff"/>
          </linearGradient>
        </defs>
        
        <!-- Grid of cubes with wave pattern -->
        <g transform="translate(100, 100) rotate(45)">
          <!-- Row 1 -->
          <rect x="-60" y="-60" width="20" height="20" fill="#ff0000" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="-30" y="-70" width="20" height="20" fill="#ff8800" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="0" y="-60" width="20" height="20" fill="#ffff00" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="30" y="-50" width="20" height="20" fill="#88ff00" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          
          <!-- Row 2 -->
          <rect x="-60" y="-30" width="20" height="20" fill="#00ff00" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="-30" y="-40" width="20" height="20" fill="#00ff88" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="0" y="-30" width="20" height="20" fill="#00ffff" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="30" y="-20" width="20" height="20" fill="#0088ff" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          
          <!-- Row 3 -->
          <rect x="-60" y="0" width="20" height="20" fill="#0000ff" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="-30" y="-10" width="20" height="20" fill="#8800ff" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="0" y="0" width="20" height="20" fill="#ff00ff" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="30" y="10" width="20" height="20" fill="#ff0088" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          
          <!-- Row 4 -->
          <rect x="-60" y="30" width="20" height="20" fill="#ff0044" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="-30" y="20" width="20" height="20" fill="#ff4400" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="0" y="30" width="20" height="20" fill="#ffaa00" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
          <rect x="30" y="40" width="20" height="20" fill="#aaff00" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
        </g>
      </svg>
    `;

    // Unicode-safe encoding
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // 明示的に Promise を返す
    return new Promise((resolve, reject) => {
      fetch(dataURL)
        .then((response) => response.blob())
        .then((blob) => resolve(blob))
        .catch((error) => {
          console.error("Error creating thumbnail blob:", error);
          reject(error);
        });
    });
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const { objects, geometries } = this.setupScene(scene);
    let time = 0;

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, time);
        renderer.render(scene, camera);
      },
      dispose: () => {
        geometries.forEach((g) => g.dispose());
        objects.forEach((obj) => obj.material.dispose());
        renderer.dispose();
      },
    };
  }
}
