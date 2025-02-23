import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Camera {
  constructor(options = {}) {
    // Default camera settings
    const {
      fov = 75,
      aspect = window.innerWidth / window.innerHeight,
      near = 0.1,
      far = 1000,
      position = [0, 5, 10],
      target = [0, 0, 0],
    } = options;

    // Create perspective camera
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(...position);
    this.camera.lookAt(...target);

    // Initialize controls
    this.controls = null;
  }

  setupControls(renderer) {
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  // Camera movement methods
  moveTo(position, target, duration = 1000) {
    const startPos = this.camera.position.clone();
    const endPos = new THREE.Vector3(...position);
    const startTarget = this.controls
      ? this.controls.target.clone()
      : new THREE.Vector3();
    const endTarget = new THREE.Vector3(...target);

    return new Promise((resolve) => {
      const startTime = performance.now();

      const animate = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easing function
        const eased = this.easeInOutCubic(progress);

        // Update position
        this.camera.position.lerpVectors(startPos, endPos, eased);

        // Update target
        if (this.controls) {
          this.controls.target.lerpVectors(startTarget, endTarget, eased);
          this.controls.update();
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  // Utility methods
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  setDefaultPosition() {
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  dispose() {
    if (this.controls) {
      this.controls.dispose();
    }
  }
}
