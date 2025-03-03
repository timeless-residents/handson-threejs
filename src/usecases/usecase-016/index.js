import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase016 extends UseCaseBase {
  static metadata = {
    id: "016",
    title: "Crystal Formation",
    description: "Growing and connecting crystal structures",
    categories: ["Geometry", "Animation", "Pattern"],
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

    // Create crystal elements
    const baseGeometry = new THREE.TetrahedronGeometry(0.5);
    geometries.push(baseGeometry);

    const positions = [
      [0, 0, 0], // Center
      [1, 1, 1], // Top right front
      [-1, 1, 1], // Top left front
      [1, 1, -1], // Top right back
      [-1, 1, -1], // Top left back
      [1, -1, 1], // Bottom right front
      [-1, -1, 1], // Bottom left front
      [1, -1, -1], // Bottom right back
      [-1, -1, -1], // Bottom left back
    ];

    positions.forEach((pos, i) => {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / positions.length, 0.7, 0.5),
        shininess: 100,
        transparent: true,
        opacity: 0.8,
      });

      const crystal = new THREE.Mesh(baseGeometry, material);
      crystal.position.set(...pos);
      scene.add(crystal);
      objects.push(crystal);
    });

    // Create connecting lines
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });

    positions.slice(1).forEach((pos) => {
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      objects.push(line);
      geometries.push(geometry);
    });

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    const numCrystals = 9; // Number of crystal meshes

    // Update crystals
    for (let i = 0; i < numCrystals; i++) {
      const crystal = objects[i];
      // Rotation
      crystal.rotation.x = time + i * 0.1;
      crystal.rotation.y = time * 0.5 + i * 0.1;

      // Pulsing scale
      const scale = 1 + Math.sin(time * 2 + i) * 0.2;
      crystal.scale.set(scale, scale, scale);

      // Color animation
      const hue = (time * 0.1 + i / numCrystals) % 1;
      crystal.material.color.setHSL(hue, 0.7, 0.5);
    }

    // Update connecting lines
    for (let i = numCrystals; i < objects.length; i++) {
      const line = objects[i];
      line.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
    }
  }

  async init() {
    const { objects } = GeometryShowcase016.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase016.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [4, 4, 4],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // Create a simple SVG representation of a crystal formation with connecting lines
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Rainbow gradient for color transitions -->
        <defs>
          <linearGradient id="crystal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff0000" stop-opacity="0.8"/>
            <stop offset="25%" stop-color="#00ff00" stop-opacity="0.8"/>
            <stop offset="50%" stop-color="#0000ff" stop-opacity="0.8"/>
            <stop offset="75%" stop-color="#ff00ff" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ffff00" stop-opacity="0.8"/>
          </linearGradient>
        </defs>
        
        <!-- Connecting lines -->
        <g opacity="0.3" stroke="#ffffff" stroke-width="1">
          <line x1="100" y1="100" x2="140" y2="60"/>
          <line x1="100" y1="100" x2="60" y2="60"/>
          <line x1="100" y1="100" x2="140" y2="140"/>
          <line x1="100" y1="100" x2="60" y2="140"/>
          <line x1="100" y1="100" x2="140" y2="100"/>
          <line x1="100" y1="100" x2="60" y2="100"/>
          <line x1="100" y1="100" x2="100" y2="60"/>
          <line x1="100" y1="100" x2="100" y2="140"/>
        </g>
        
        <!-- Crystal tetrahedrons -->
        <g fill="url(#crystal-gradient)" stroke="#ffffff" stroke-width="1">
          <!-- Center crystal -->
          <polygon points="100,90 110,100 90,100 100,110" fill="#ffffff" opacity="0.9"/>
          
          <!-- Surrounding crystals -->
          <polygon points="140,50 150,60 130,60 140,70" fill="#ff3366" opacity="0.8"/>
          <polygon points="60,50 70,60 50,60 60,70" fill="#33ff66" opacity="0.8"/>
          <polygon points="140,130 150,140 130,140 140,150" fill="#6633ff" opacity="0.8"/>
          <polygon points="60,130 70,140 50,140 60,150" fill="#ff9933" opacity="0.8"/>
          <polygon points="140,90 150,100 130,100 140,110" fill="#33ffff" opacity="0.8"/>
          <polygon points="60,90 70,100 50,100 60,110" fill="#ff33ff" opacity="0.8"/>
          <polygon points="100,50 110,60 90,60 100,70" fill="#ffff33" opacity="0.8"/>
          <polygon points="100,130 110,140 90,140 100,150" fill="#3366ff" opacity="0.8"/>
        </g>
      </svg>
    `;

    // Unicode-safe encoding
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // Convert to Blob
    return fetch(dataURL).then((res) => res.blob());
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 4, 4);
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
