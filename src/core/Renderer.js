import * as THREE from "three";

export class Renderer {
  constructor(options = {}) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      ...options,
    });

    // Set default properties
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add to DOM
    document.body.appendChild(this.renderer.domElement);

    // Handle resize
    window.addEventListener("resize", this.onResize.bind(this));
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  // Additional rendering features
  enableShadows(enabled = true) {
    this.renderer.shadowMap.enabled = enabled;
  }

  setPixelRatio(ratio) {
    this.renderer.setPixelRatio(ratio);
  }

  dispose() {
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}
