import { SceneManager } from "./core/SceneManager";
import { Renderer } from "./core/Renderer";
import { Camera } from "./core/Camera";
import * as THREE from "three";

const manager = new SceneManager();
const renderer = new Renderer();
const camera = new Camera();
const clock = new THREE.Clock();

// URLからシーンIDを取得
const params = new URLSearchParams(window.location.search);
const sceneId = params.get("id") || "000";

// 指定されたシーンを読み込み
manager.loadUseCase(sceneId);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  manager.update(clock.getDelta());
  renderer.render(manager.scene, camera.camera);
}

animate();
