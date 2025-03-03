import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase015 extends UseCaseBase {
  static metadata = {
    id: "015",
    title: "Spiral Tower",
    description: "Animated spiral tower with rotating elements",
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

    // Create base geometry
    const geometry = new THREE.OctahedronGeometry(0.5);
    geometries.push(geometry);

    // Create spiral tower
    const numLevels = 15;
    const spiralRadius = 2;
    const heightStep = 0.5;

    for (let i = 0; i < numLevels; i++) {
      const angle = (i / numLevels) * Math.PI * 4; // 2 complete rotations
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / numLevels, 0.7, 0.5),
      });

      const shape = new THREE.Mesh(geometry, material);

      // Position in spiral pattern
      shape.position.x = Math.cos(angle) * spiralRadius;
      shape.position.z = Math.sin(angle) * spiralRadius;
      shape.position.y = i * heightStep;

      scene.add(shape);
      objects.push(shape);
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    objects.forEach((shape, i) => {
      // Rotation animation
      shape.rotation.x = time * 2;
      shape.rotation.y = time * 1.5;

      // Vertical oscillation
      shape.position.y += Math.sin(time * 3 + i) * 0.02;

      // Spiral radius breathing
      const angle = (i / objects.length) * Math.PI * 4;
      const radiusScale = 1 + Math.sin(time * 2) * 0.2;
      shape.position.x = Math.cos(angle) * 2 * radiusScale;
      shape.position.z = Math.sin(angle) * 2 * radiusScale;

      // Color animation
      const hue = (time * 0.1 + i / objects.length) % 1;
      shape.material.color.setHSL(hue, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase015.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase015.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 10, 8],
      target: [0, 5, 0],
    };
  }

  static getThumbnailBlob() {
    // Create a simple SVG representation of a spiral tower with rotating elements
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Rainbow gradient for color transitions -->
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff0000"/>
            <stop offset="16.6%" stop-color="#ff8800"/>
            <stop offset="33.3%" stop-color="#ffff00"/>
            <stop offset="50%" stop-color="#00ff00"/>
            <stop offset="66.6%" stop-color="#0088ff"/>
            <stop offset="83.3%" stop-color="#0000ff"/>
            <stop offset="100%" stop-color="#ff00ff"/>
          </linearGradient>
        </defs>
        
        <!-- Spiral tower with octahedrons -->
        <g transform="translate(100, 180) scale(0.8)">
          <!-- Level 1 (bottom) -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#ff0000" stroke="#ffffff" stroke-width="1" transform="translate(30, -20)"/>
          
          <!-- Level 2 -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#ff8800" stroke="#ffffff" stroke-width="1" transform="translate(20, -40)"/>
          
          <!-- Level 3 -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#ffff00" stroke="#ffffff" stroke-width="1" transform="translate(0, -60)"/>
          
          <!-- Level 4 -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#00ff00" stroke="#ffffff" stroke-width="1" transform="translate(-20, -80)"/>
          
          <!-- Level 5 -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#00ffff" stroke="#ffffff" stroke-width="1" transform="translate(-30, -100)"/>
          
          <!-- Level 6 -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#0000ff" stroke="#ffffff" stroke-width="1" transform="translate(-20, -120)"/>
          
          <!-- Level 7 -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#8800ff" stroke="#ffffff" stroke-width="1" transform="translate(0, -140)"/>
          
          <!-- Level 8 (top) -->
          <polygon points="0,-10 10,0 0,10 -10,0" fill="#ff00ff" stroke="#ffffff" stroke-width="1" transform="translate(20, -160)"/>
          
          <!-- Spiral path (background) -->
          <path d="M30,-20 C25,-30 20,-40 0,-60 C-20,-80 -30,-100 -20,-120 C-10,-130 0,-140 20,-160" 
                fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="5,5" opacity="0.3"/>
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
    camera.position.set(8, 10, 8);
    camera.lookAt(0, 5, 0);

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
