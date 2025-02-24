import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase013 extends UseCaseBase {
  static metadata = {
    id: "013",
    title: "Wave Animation Grid",
    description: "Grid of cubes animating in a wave pattern",
    categories: ["Geometry", "Animation", "Grid"],
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
    const gridSize = 10;
    const spacing = 1.2;

    // Create cube geometry (reused for all cubes)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometries.push(geometry);

    // Create grid of cubes
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(x / gridSize, 0.7, 0.5),
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = (x - gridSize / 2) * spacing;
        cube.position.z = (z - gridSize / 2) * spacing;
        scene.add(cube);
        objects.push(cube);
      }
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    const gridSize = Math.sqrt(objects.length);
    objects.forEach((cube, index) => {
      const x = Math.floor(index / gridSize);
      const z = index % gridSize;

      // Wave animation
      const distance = Math.sqrt(x * x + z * z);
      const offset = distance * 0.5;
      cube.position.y = Math.sin(time * 2 + offset) * 0.5;

      // Rotation
      cube.rotation.x = Math.sin(time + offset) * 0.3;
      cube.rotation.z = Math.cos(time + offset) * 0.3;

      // Color animation
      cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase013.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase013.updateObjects(Array.from(this.objects), this.time);
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
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
