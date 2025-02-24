import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase016 extends UseCaseBase {
  static metadata = {
    id: "016",
    title: "Crystal Formation",
    description: "Growing and connecting crystal structures",
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

    // Create crystal elements
    const baseGeometry = new THREE.TetrahedronGeometry(0.5);
    geometries.push(baseGeometry);

    const positions = [
      [0, 0, 0], // Center
      [1, 1, 1], // Top right front
      [-1, 1, 1], // Top left front
      [1, 1, -1], // Top right back
      [-1, 1, -1], // Top left back
      [1, -1, 1], // Bottom right front
      [-1, -1, 1], // Bottom left front
      [1, -1, -1], // Bottom right back
      [-1, -1, -1], // Bottom left back
    ];

    positions.forEach((pos, i) => {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / positions.length, 0.7, 0.5),
        shininess: 100,
        transparent: true,
        opacity: 0.8,
      });

      const crystal = new THREE.Mesh(baseGeometry, material);
      crystal.position.set(...pos);
      scene.add(crystal);
      objects.push(crystal);
    });

    // Create connecting lines
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });

    positions.slice(1).forEach((pos) => {
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      objects.push(line);
      geometries.push(geometry);
    });

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    const numCrystals = 9; // Number of crystal meshes

    // Update crystals
    for (let i = 0; i < numCrystals; i++) {
      const crystal = objects[i];
      // Rotation
      crystal.rotation.x = time + i * 0.1;
      crystal.rotation.y = time * 0.5 + i * 0.1;

      // Pulsing scale
      const scale = 1 + Math.sin(time * 2 + i) * 0.2;
      crystal.scale.set(scale, scale, scale);

      // Color animation
      const hue = (time * 0.1 + i / numCrystals) % 1;
      crystal.material.color.setHSL(hue, 0.7, 0.5);
    }

    // Update connecting lines
    for (let i = numCrystals; i < objects.length; i++) {
      const line = objects[i];
      line.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
    }
  }

  async init() {
    const { objects } = GeometryShowcase016.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase016.updateObjects(Array.from(this.objects), this.time);
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 4, 4);
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
