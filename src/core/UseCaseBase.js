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
}
