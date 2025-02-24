import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase012 extends UseCaseBase {
  static metadata = {
    id: "012",
    title: "Simple Shapes Animation",
    description: "Animated geometric shapes with color transitions",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
  }

  static setupScene(scene) {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Create geometries
    const geometries = [
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.TorusGeometry(1, 0.4, 16, 100),
    ];

    // Create materials with different colors
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
      new THREE.MeshPhongMaterial({ color: 0xff0000 }),
      new THREE.MeshPhongMaterial({ color: 0x0000ff }),
    ];

    // Create meshes and position them
    const meshes = geometries.map((geo, i) => {
      const mesh = new THREE.Mesh(geo, materials[i]);
      mesh.position.x = (i - 1) * 3; // Space them horizontally
      scene.add(mesh);
      return mesh;
    });

    return { objects: meshes, geometries };
  }

  static updateObjects(objects, time) {
    objects.forEach((mesh, i) => {
      // Unique rotation for each mesh
      mesh.rotation.x = time * (0.5 + i * 0.2);
      mesh.rotation.y = time * (0.3 + i * 0.2);

      // Add some bouncing motion
      mesh.position.y = Math.sin(time * 2 + i) * 0.5;

      // Update material color
      const hue = (time * 0.1 + i * 0.3) % 1;
      mesh.material.color.setHSL(hue, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase012.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase012.updateObjects(Array.from(this.objects), this.time);
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 12); // Moved camera back to see all objects
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
