import * as THREE from "three";

class SceneManager {
  static instance = null;

  constructor() {
    if (SceneManager.instance) {
      return SceneManager.instance;
    }

    this.scene = new THREE.Scene();
    this.renderer = null;
    this.activeUseCase = null;
    this.animationFrameId = null;
    this.isTransitioning = false;

    SceneManager.instance = this;
  }

  static getInstance() {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  initRenderer(container, options = {}) {
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    // 既存のrendererがある場合は破棄
    this.disposeRenderer();

    // 新しいrendererを作成
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      ...options,
    });

    return this.renderer;
  }

  disposeRenderer() {
    if (this.renderer) {
      // アニメーションフレームをキャンセル
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // レンダラーを破棄
      this.renderer.dispose();
      this.renderer.forceContextLoss();

      // DOMから削除
      const canvas = this.renderer.domElement;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }

      this.renderer = null;
    }
  }

  async loadUseCase(id) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      // Dynamic import of usecase
      const module = await import(
        `../usecases/usecase-${id.padStart(3, "0")}/index.js`
      );

      // Cleanup previous usecase
      this.dispose();

      // Initialize new usecase
      this.activeUseCase = new module.default(this.scene);
      await this.activeUseCase.init();
    } catch (error) {
      console.error(`Failed to load usecase ${id}:`, error);
    } finally {
      this.isTransitioning = false;
    }
  }

  startAnimation(animate) {
    const loop = () => {
      if (this.renderer && !this.renderer.domElement.parentNode) {
        this.stopAnimation();
        return;
      }

      if (animate) {
        animate();
      } else if (this.activeUseCase && this.activeUseCase.update) {
        this.activeUseCase.update();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // サムネイル生成用メソッド
  async generateThumbnail(container) {
    return new Promise((resolve) => {
      this.initRenderer(container);

      // 1フレームレンダリング
      if (this.activeUseCase && this.activeUseCase.update) {
        this.activeUseCase.update();
      }

      // レンダリング結果を取得
      const canvas = this.renderer.domElement;
      const thumbnailDataUrl = canvas.toDataURL("image/png");

      // クリーンアップ
      this.dispose();

      resolve(thumbnailDataUrl);
    });
  }
  update(deltaTime) {
    if (this.activeUseCase && this.activeUseCase.update) {
      this.activeUseCase.update(deltaTime);
    }
  }

  dispose() {
    this.stopAnimation();
    this.disposeRenderer();

    if (this.activeUseCase) {
      this.activeUseCase.dispose();
      this.activeUseCase = null;
    }

    // シーンのクリーンアップ
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}

export default SceneManager;
