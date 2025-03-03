import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase009 extends UseCaseBase {
  static metadata = {
    id: "009",
    title: "Twisting Torus Knot",
    description: "A torus knot with complex rotation",
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

    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
    const material = new THREE.MeshPhongMaterial({ color: 0xff8800 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.x += deltaTime;
    objects[0].rotation.y += deltaTime * 0.5;
    objects[0].rotation.z += deltaTime * 0.3;
  }

  async init() {
    const { objects } = GeometryShowcase009.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase009.updateObjects(
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
    // Create a simple SVG representation of an orange torus knot
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Torus knot representation -->
        <path d="M60,100 C60,60 100,60 100,100 S140,140 140,100 S100,60 100,100 S60,140 60,100 Z" 
              fill="none" stroke="#ff8800" stroke-width="12" stroke-linecap="round"/>
        
        <path d="M60,100 C60,60 100,60 100,100 S140,140 140,100 S100,60 100,100 S60,140 60,100 Z" 
              fill="none" stroke="#ffaa00" stroke-width="6" stroke-linecap="round"/>
        
        <!-- Highlight -->
        <path d="M80,80 C90,70 100,70 110,80" 
              fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
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
