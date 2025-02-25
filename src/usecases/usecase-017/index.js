import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase017 extends UseCaseBase {
  static metadata = {
    id: "017",
    title: "Ring-Cut Cylinder Pattern",
    description:
      "Cylinder with ring cuts that slide up and down to create dynamic patterns",
    categories: ["Geometry", "Animation", "Pattern", "Interactive"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.initialPositions = [];
  }

  static setupScene(scene) {
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const objects = [];
    const geometries = [];

    const ringCount = 8;
    const radialSegments = 32;
    const radius = 1;
    const height = 4;
    const ringHeight = 0.2;
    const ringDepth = 0.2;

    for (let i = 0; i < ringCount; i++) {
      const yPos = -height / 2 + (height * (i + 0.5)) / ringCount;
      const segmentHeight = height / ringCount;

      const topGeometry = new THREE.CylinderGeometry(
        radius,
        radius,
        segmentHeight - ringHeight,
        radialSegments
      );
      const topMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / ringCount, 0.7, 0.5),
        shininess: 100,
      });
      const topCylinder = new THREE.Mesh(topGeometry, topMaterial);
      topCylinder.position.y = yPos + (segmentHeight - ringHeight) / 2;
      scene.add(topCylinder);
      objects.push(topCylinder);
      geometries.push(topGeometry);

      const ringGeometry = new THREE.TorusGeometry(
        radius - ringDepth / 2,
        ringDepth,
        16,
        radialSegments
      );
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i + 0.5) / ringCount, 0.9, 0.3),
        shininess: 120,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = yPos;
      scene.add(ring);
      objects.push(ring);
      geometries.push(ringGeometry);
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time, initialPositions) {
    const ringCount = 8;

    // If initialPositions is not provided, calculate them based on current positions
    const positions = initialPositions || objects.map(obj => obj.position.y);

    for (let i = 0; i < ringCount; i++) {
      const index = i * 2;
      const topCylinder = objects[index];
      const ring = objects[index + 1];

      const slideFactor = 0.3;
      const phaseOffset = i * (Math.PI / 4);
      const slideY = Math.sin(time * 2 + phaseOffset) * slideFactor;

      topCylinder.position.y = positions[index] + slideY;
      ring.position.y = positions[index + 1] + slideY;

      topCylinder.rotation.y = time * 0.5 + i * 0.1;
      ring.rotation.y = time * 0.5 + i * 0.1;

      const hue = (time * 0.1 + i / ringCount) % 1;
      topCylinder.material.color.setHSL(hue, 0.7, 0.5);
      ring.material.color.setHSL((hue + 0.5) % 1, 0.9, 0.3);
    }
  }

  async init() {
    const { objects } = GeometryShowcase017.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.initialPositions = objects.map((obj) => obj.position.y);
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase017.updateObjects(
      Array.from(this.objects),
      this.time,
      this.initialPositions
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [4, 2, 4],
      target: [0, 0, 0],
    };
  }

  // Direct implementation of getThumbnailBlob to ensure it works correctly
  static async getThumbnailBlob(width = 200, height = 200) {
    try {
      // Create an offscreen renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);

      // Setup camera
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(4, 2, 4);
      camera.lookAt(0, 0, 0);

      // Setup scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111111);

      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(ambientLight, directionalLight);

      // Setup scene objects
      const { objects, geometries } = this.setupScene(scene);
      
      // Store initial positions for animation
      const initialPositions = objects.map(obj => obj.position.y);

      // Use updateObjects for animation with initial positions
      this.updateObjects(objects, 1.0, initialPositions);

      // Render the scene
      renderer.render(scene, camera);

      // Get the thumbnail as data URL and convert to blob
      const dataURL = renderer.domElement.toDataURL("image/png");
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Cleanup
      objects.forEach((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      geometries.forEach(g => g.dispose());
      renderer.dispose();

      return blob;
    } catch (error) {
      console.warn(`Failed to generate thumbnail: ${error.message}`);
      throw error;
    }
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 2, 4);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const { objects, geometries } = this.setupScene(scene);
    const initialPositions = objects.map((obj) => obj.position.y);
    let time = 0;

    const animate = () => {
      time += 0.016;
      this.updateObjects(objects, time, initialPositions);
      renderer.render(scene, camera);
    };

    // Initial render
    animate();

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, time, initialPositions);
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
