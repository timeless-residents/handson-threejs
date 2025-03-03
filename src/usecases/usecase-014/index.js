import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase014 extends UseCaseBase {
  static metadata = {
    id: "014",
    title: "Rotating Rings",
    description: "Concentric rings rotating with dynamic colors",
    categories: ["Geometry", "Animation", "Rings"],
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
    const numRings = 8;

    // Create rings with different radii
    for (let i = 0; i < numRings; i++) {
      const radius = 1 + i * 0.5;
      const tubeRadius = 0.1;
      const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
      geometries.push(geometry);

      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / numRings, 0.7, 0.5),
      });

      const ring = new THREE.Mesh(geometry, material);
      scene.add(ring);
      objects.push(ring);
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    objects.forEach((ring, i) => {
      // Rotation animation
      ring.rotation.x = time * (0.2 + i * 0.1);
      ring.rotation.y = time * (0.3 + i * 0.1);

      // Color animation
      const hue = (time * 0.1 + i * 0.1) % 1;
      ring.material.color.setHSL(hue, 0.7, 0.5);

      // Scale pulsing
      const scale = 1 + Math.sin(time * 2 + i) * 0.1;
      ring.scale.set(scale, scale, scale);
    });
  }

  async init() {
    const { objects } = GeometryShowcase014.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase014.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 8, 8],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // Create a simple SVG representation of concentric rings with dynamic colors
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Rainbow gradient for color transitions -->
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff0000"/>
            <stop offset="16.6%" stop-color="#ff8800"/>
            <stop offset="33.3%" stop-color="#ffff00"/>
            <stop offset="50%" stop-color="#00ff00"/>
            <stop offset="66.6%" stop-color="#0088ff"/>
            <stop offset="83.3%" stop-color="#0000ff"/>
            <stop offset="100%" stop-color="#ff00ff"/>
          </linearGradient>
        </defs>
        
        <!-- Concentric rings with different colors and rotations -->
        <g transform="translate(100, 100)">
          <!-- Ring 1 (innermost) -->
          <ellipse cx="0" cy="0" rx="20" ry="10" fill="none" stroke="#ff0000" stroke-width="3" transform="rotate(0)"/>
          
          <!-- Ring 2 -->
          <ellipse cx="0" cy="0" rx="30" ry="15" fill="none" stroke="#ff8800" stroke-width="3" transform="rotate(15)"/>
          
          <!-- Ring 3 -->
          <ellipse cx="0" cy="0" rx="40" ry="20" fill="none" stroke="#ffff00" stroke-width="3" transform="rotate(30)"/>
          
          <!-- Ring 4 -->
          <ellipse cx="0" cy="0" rx="50" ry="25" fill="none" stroke="#00ff00" stroke-width="3" transform="rotate(45)"/>
          
          <!-- Ring 5 -->
          <ellipse cx="0" cy="0" rx="60" ry="30" fill="none" stroke="#00ffff" stroke-width="3" transform="rotate(60)"/>
          
          <!-- Ring 6 -->
          <ellipse cx="0" cy="0" rx="70" ry="35" fill="none" stroke="#0000ff" stroke-width="3" transform="rotate(75)"/>
          
          <!-- Ring 7 (outermost) -->
          <ellipse cx="0" cy="0" rx="80" ry="40" fill="none" stroke="#ff00ff" stroke-width="3" transform="rotate(90)"/>
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
    camera.position.set(8, 8, 8);
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
