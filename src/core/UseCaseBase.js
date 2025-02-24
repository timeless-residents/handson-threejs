import * as THREE from "three";

export class UseCaseBase {
  static metadata = {
    id: "",
    title: "",
    description: "",
    categories: [],
  };

  constructor(scene) {
    this.scene = scene;
    this.objects = new Set();
  }

  async init() {
    // Override in child class
  }

  update(deltaTime) {
    // Override in child class
  }

  dispose() {
    // Cleanup resources
    this.objects.forEach((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.scene.remove(obj);
    });
    this.objects.clear();
  }

  // Setup default lighting for thumbnails
  static setupDefaultLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);
    return [ambientLight, directionalLight];
  }

  // Base thumbnail generation method that can be overridden by subclasses if needed
  static generateThumbnail(width = 200, height = 200) {
    // Create an offscreen renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const cameraSettings = this.getThumbnailCameraPosition();
    camera.position.set(...cameraSettings.position);
    camera.lookAt(...cameraSettings.target);

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Add default lighting if needed
    const lights = this.setupDefaultLighting(scene);

    // Check if the class has setupScene method
    if (typeof this.setupScene !== "function") {
      throw new Error("setupScene method not implemented");
    }

    // Setup scene objects
    const { objects } = this.setupScene(scene);

    // If the class has an updateObjects method, use it for animation
    if (typeof this.updateObjects === "function") {
      this.updateObjects(objects, 1.0, { x: 0, y: 0 });
    }

    // Render the scene
    renderer.render(scene, camera);

    // Get the thumbnail as base64 data URL
    const thumbnailURL = renderer.domElement.toDataURL("image/png");

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

    // Cleanup lights
    lights.forEach((light) => {
      scene.remove(light);
      if (light.dispose) light.dispose();
    });

    renderer.dispose();

    return thumbnailURL;
  }

  // Base method for getting thumbnail as Blob
  static async getThumbnailBlob(width = 200, height = 200) {
    try {
      const dataURL = this.generateThumbnail(width, height);
      const response = await fetch(dataURL);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.warn(`Failed to generate thumbnail: ${error.message}`);
      throw error;
    }
  }

  // Optional method to customize thumbnail camera position
  static getThumbnailCameraPosition() {
    return {
      position: [0, 2, 8],
      target: [0, 0, 0],
    };
  }
}
