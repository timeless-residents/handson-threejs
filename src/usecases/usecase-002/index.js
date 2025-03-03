import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase002 extends UseCaseBase {
  static metadata = {
    id: "002",
    title: "Bouncing Torus",
    description: "A torus that bounces up and down",
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

    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].position.y = Math.sin(time * 2) * 0.5;
    objects[0].rotation.x += deltaTime * 0.5;
  }

  async init() {
    const { objects } = GeometryShowcase002.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase002.updateObjects(
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
    // Create a simple SVG representation of a blue torus
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Torus representation -->
        <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0000ff" stroke-width="20" />
        <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0066ff" stroke-width="10" />
        <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0099ff" stroke-width="5" />
        
        <!-- Highlight -->
        <ellipse cx="80" cy="85" rx="10" ry="5" fill="#ffffff" opacity="0.3" />
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
