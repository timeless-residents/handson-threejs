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

  static getThumbnailCameraPosition() {
    return {
      position: [0, 2, 8],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // Create a simple SVG representation of a colorful particle system
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Particles with various colors -->
        <g>
          <circle cx="60" cy="70" r="2" fill="#ff3366" opacity="0.8"/>
          <circle cx="80" cy="50" r="1.5" fill="#33ff66" opacity="0.8"/>
          <circle cx="100" cy="80" r="2.5" fill="#6633ff" opacity="0.8"/>
          <circle cx="120" cy="60" r="1.8" fill="#ff9933" opacity="0.8"/>
          <circle cx="140" cy="90" r="2.2" fill="#33ffff" opacity="0.8"/>
          <circle cx="70" cy="100" r="1.7" fill="#ff33ff" opacity="0.8"/>
          <circle cx="90" cy="120" r="2.3" fill="#ffff33" opacity="0.8"/>
          <circle cx="110" cy="110" r="1.6" fill="#3366ff" opacity="0.8"/>
          <circle cx="130" cy="130" r="2.1" fill="#ff6633" opacity="0.8"/>
          <circle cx="150" cy="70" r="1.9" fill="#33ff99" opacity="0.8"/>
          <circle cx="50" cy="90" r="2.4" fill="#9933ff" opacity="0.8"/>
          <circle cx="65" cy="110" r="1.4" fill="#ff3399" opacity="0.8"/>
          <circle cx="85" cy="130" r="2.6" fill="#33ffcc" opacity="0.8"/>
          <circle cx="105" cy="50" r="1.3" fill="#cc33ff" opacity="0.8"/>
          <circle cx="125" cy="80" r="2.7" fill="#ffcc33" opacity="0.8"/>
          <circle cx="145" cy="100" r="1.2" fill="#33ccff" opacity="0.8"/>
          <circle cx="55" cy="60" r="2.8" fill="#ff33cc" opacity="0.8"/>
          <circle cx="75" cy="80" r="1.1" fill="#66ff33" opacity="0.8"/>
          <circle cx="95" cy="100" r="2.9" fill="#3399ff" opacity="0.8"/>
          <circle cx="115" cy="120" r="1.0" fill="#ff9966" opacity="0.8"/>
          <circle cx="135" cy="50" r="3.0" fill="#9966ff" opacity="0.8"/>
          <circle cx="155" cy="110" r="1.5" fill="#ff6699" opacity="0.8"/>
          <circle cx="45" cy="130" r="2.0" fill="#66ff99" opacity="0.8"/>
        </g>
        
        <!-- Cursor influence area -->
        <circle cx="100" cy="100" r="30" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
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
