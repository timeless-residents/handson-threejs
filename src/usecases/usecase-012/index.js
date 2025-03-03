import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase012 extends UseCaseBase {
  static metadata = {
    id: "012",
    title: "Simple Shapes Animation",
    description: "Animated geometric shapes with color transitions",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
  }

  static setupScene(scene) {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Create geometries
    const geometries = [
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.TorusGeometry(1, 0.4, 16, 100),
    ];

    // Create materials with different colors
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
      new THREE.MeshPhongMaterial({ color: 0xff0000 }),
      new THREE.MeshPhongMaterial({ color: 0x0000ff }),
    ];

    // Create meshes and position them
    const meshes = geometries.map((geo, i) => {
      const mesh = new THREE.Mesh(geo, materials[i]);
      mesh.position.x = (i - 1) * 3; // Space them horizontally
      scene.add(mesh);
      return mesh;
    });

    return { objects: meshes, geometries };
  }

  static updateObjects(objects, time) {
    objects.forEach((mesh, i) => {
      // Unique rotation for each mesh
      mesh.rotation.x = time * (0.5 + i * 0.2);
      mesh.rotation.y = time * (0.3 + i * 0.2);

      // Add some bouncing motion
      mesh.position.y = Math.sin(time * 2 + i) * 0.5;

      // Update material color
      const hue = (time * 0.1 + i * 0.3) % 1;
      mesh.material.color.setHSL(hue, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase012.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase012.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 2, 12],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // Create a simple SVG representation of animated geometric shapes with color transitions
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Rainbow gradient for color transitions -->
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff0000"/>
            <stop offset="16.6%" stop-color="#ff8800"/>
            <stop offset="33.3%" stop-color="#ffff00"/>
            <stop offset="50%" stop-color="#00ff00"/>
            <stop offset="66.6%" stop-color="#0088ff"/>
            <stop offset="83.3%" stop-color="#0000ff"/>
            <stop offset="100%" stop-color="#ff00ff"/>
          </linearGradient>
        </defs>
        
        <!-- Cube (left) -->
        <g transform="translate(50, 100)">
          <polygon points="0,0 -20,-20 -20,-40 0,-20" fill="url(#rainbow)" opacity="0.9" stroke="#ffffff" stroke-width="1"/>
          <polygon points="0,0 0,-20 20,-40 20,-20" fill="url(#rainbow)" opacity="0.7" stroke="#ffffff" stroke-width="1"/>
          <polygon points="0,-20 -20,-40 20,-40 20,-20" fill="url(#rainbow)" opacity="0.8" stroke="#ffffff" stroke-width="1"/>
        </g>
        
        <!-- Sphere (center) -->
        <circle cx="100" cy="100" r="25" fill="url(#rainbow)" opacity="0.9" stroke="#ffffff" stroke-width="1"/>
        <circle cx="90" cy="90" r="8" fill="#ffffff" opacity="0.3"/>
        
        <!-- Torus (right) -->
        <ellipse cx="150" cy="100" rx="25" ry="10" fill="none" stroke="url(#rainbow)" stroke-width="10" opacity="0.9"/>
        <ellipse cx="150" cy="100" rx="25" ry="10" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
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
    camera.position.set(0, 2, 12); // Moved camera back to see all objects
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
