import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase011 extends UseCaseBase {
  static metadata = {
    id: "011",
    title: "Interactive Particle System",
    description: "A dynamic particle system that responds to mouse movement",
    categories: ["Particles", "Interactive"],
  };

  constructor(scene) {
    super(scene);
    this.particles = null;
    this.particleCount = 1000;
    this.mouse = new THREE.Vector2();
    this.time = 0;
  }

  static setupScene(scene) {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    const colors = new Float32Array(1000 * 3);

    for (let i = 0; i < 1000 * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      colors[i] = Math.random();
      colors[i + 1] = Math.random();
      colors[i + 2] = Math.random();
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(particles, material);
    scene.add(points);

    return { objects: [points], geometries: [particles] };
  }

  static updateObjects(objects, time, mouse = { x: 0, y: 0 }) {
    const positions = objects[0].geometry.attributes.position.array;
    const colors = objects[0].geometry.attributes.color.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(time + i) * 0.01;
      positions[i + 1] += Math.cos(time + i) * 0.01;

      const distance = Math.sqrt(
        Math.pow(positions[i] - mouse.x, 2) +
          Math.pow(positions[i + 1] - mouse.y, 2)
      );

      if (distance < 2) {
        positions[i] += (mouse.x - positions[i]) * 0.02;
        positions[i + 1] += (mouse.y - positions[i + 1]) * 0.02;
      }
    }

    objects[0].geometry.attributes.position.needsUpdate = true;
    objects[0].geometry.attributes.color.needsUpdate = true;
  }

  async init() {
    const { objects } = GeometryShowcase011.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));

    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase011.updateObjects(
      Array.from(this.objects),
      this.time,
      this.mouse
    );
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
    const mouse = { x: 0, y: 0 };

    container.addEventListener("mousemove", (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    });

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, time, mouse);
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
