import * as THREE from "three";

export class ThumbnailRenderer {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  initialize(width = 200, height = 200) {
    if (!this.renderer) {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });

      // コンテキストロスト時のハンドリング
      this.renderer.domElement.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        console.warn("WebGL context lost, reinitializing...");
        this.dispose();
        this.initialize(width, height);
      });
    }

    this.renderer.setSize(width, height);

    // カメラの初期化
    if (!this.camera) {
      this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      this.camera.position.set(0, 2, 8);
      this.camera.lookAt(0, 0, 0);
    }

    // シーンの初期化
    if (!this.scene) {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x111111);
    }

    return this.renderer;
  }

  async generateThumbnail(SceneClass, width = 200, height = 200) {
    try {
      this.initialize(width, height);

      // シーンをクリア
      while (this.scene.children.length > 0) {
        const object = this.scene.children[0];
        this.scene.remove(object);
        if (object.material) object.material.dispose();
        if (object.geometry) object.geometry.dispose();
      }

      // シーンのセットアップ
      const { objects, lights } = SceneClass.setupScene(this.scene);

      if (typeof SceneClass.updateObjects === "function") {
        SceneClass.updateObjects(objects, 1.0);
      }

      // レンダリング
      this.renderer.render(this.scene, this.camera);
      const dataURL = this.renderer.domElement.toDataURL("image/png");

      // クリーンアップ
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

      if (lights) {
        lights.forEach((light) => {
          this.scene.remove(light);
          if (light.dispose) light.dispose();
        });
      }

      const response = await fetch(dataURL);
      return await response.blob();
    } catch (error) {
      console.warn(`Failed to generate thumbnail: ${error.message}`);

      if (++this.retryCount < this.maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * this.retryCount)
        );
        return this.generateThumbnail(SceneClass, width, height);
      }

      throw error;
    }
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
  }
}
