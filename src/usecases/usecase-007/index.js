import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase007 extends UseCaseBase {
  static metadata = {
    id: "007",
    title: "Color-Changing Octahedron",
    description: "An octahedron with cycling colors",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
  }

  static setupScene(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const geometry = new THREE.OctahedronGeometry(1);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.y += deltaTime;
    objects[0].material.color.setHSL(time % 1, 0.5, 0.5);
  }

  async init() {
    const { objects } = GeometryShowcase007.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase007.updateObjects(
      Array.from(this.objects),
      this.time,
      deltaTime
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 2, 8],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // Create a simple SVG representation of a color-changing octahedron
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Octahedron representation with rainbow gradient -->
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
        
        <!-- Top pyramid -->
        <polygon points="100,60 140,100 100,100 60,100" fill="url(#rainbow)" stroke="#ffffff" stroke-width="1"/>
        
        <!-- Bottom pyramid -->
        <polygon points="100,140 140,100 100,100 60,100" fill="url(#rainbow)" opacity="0.8" stroke="#ffffff" stroke-width="1"/>
        
        <!-- Highlight -->
        <polygon points="100,60 110,80 90,80" fill="#ffffff" opacity="0.3"/>
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
    camera.position.set(0, 2, 8);
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
