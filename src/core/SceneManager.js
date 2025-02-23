import * as THREE from "three";

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.activeUseCase = null;
  }

  async loadUseCase(id) {
    try {
      // Dynamic import of usecase
      const module = await import(
        `../usecases/usecase-${id.padStart(3, "0")}/index.js`
      );

      // Cleanup previous usecase if exists
      if (this.activeUseCase) {
        this.activeUseCase.dispose();
      }

      // Initialize new usecase
      this.activeUseCase = new module.default(this.scene);
      await this.activeUseCase.init();
    } catch (error) {
      console.error(`Failed to load usecase ${id}:`, error);
    }
  }

  update(deltaTime) {
    if (this.activeUseCase && this.activeUseCase.update) {
      this.activeUseCase.update(deltaTime);
    }
  }
}
