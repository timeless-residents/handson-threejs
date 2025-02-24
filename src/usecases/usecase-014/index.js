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
