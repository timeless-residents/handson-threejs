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
