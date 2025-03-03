import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase010 extends UseCaseBase {
  static metadata = {
    id: "010",
    title: "Cube and Sphere Duo",
    description: "A spinning cube and a bouncing sphere",
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

    const geometries = [
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.SphereGeometry(1, 32, 32),
    ];
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xff4444 }),
      new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
    ];
    const positions = [
      [-2, 0, 0],
      [2, 0, 0],
    ];
    const objects = [];

    geometries.forEach((geometry, i) => {
      const mesh = new THREE.Mesh(geometry, materials[i]);
      mesh.position.set(...positions[i]);
      scene.add(mesh);
      objects.push(mesh);
    });

    return { objects, geometries };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.x += deltaTime;
    objects[0].rotation.y += deltaTime;
    objects[1].position.y = Math.sin(time * 2) * 0.5;
    objects[1].rotation.z += deltaTime * 0.5;
  }

  async init() {
    const { objects } = GeometryShowcase010.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase010.updateObjects(
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
    // Create a simple SVG representation of a red cube and green sphere
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Red cube -->
        <g transform="translate(70, 100)">
          <!-- Front face -->
          <polygon points="0,0 -30,-30 -30,-60 0,-30" fill="#ff4444" stroke="#ffffff" stroke-width="1"/>
          <!-- Right face -->
          <polygon points="0,0 0,-30 30,-60 30,-30" fill="#cc3333" stroke="#ffffff" stroke-width="1"/>
          <!-- Top face -->
          <polygon points="0,-30 -30,-60 30,-60 30,-30" fill="#aa2222" stroke="#ffffff" stroke-width="1"/>
        </g>
        
        <!-- Green sphere -->
        <circle cx="130" cy="100" r="30" fill="#44ff44" stroke="#ffffff" stroke-width="1"/>
        
        <!-- Sphere highlight -->
        <circle cx="120" cy="90" r="10" fill="#ffffff" opacity="0.3"/>
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
