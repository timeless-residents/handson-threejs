import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase004 extends UseCaseBase {
  static metadata = {
    id: "004",
    title: "Rotating Cylinder with Marker",
    description:
      "A cylinder spinning around its Y-axis with a marker to show rotation clearly",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
  }

  static setupScene(scene) {
    // 環境光と平行光源を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // グリッドヘルパーを追加して回転が分かりやすくする
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // シリンダーとマーカーをまとめるグループを作成
    const group = new THREE.Group();

    // シリンダーの作成
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    group.add(cylinder);

    // マーカーとして、シリンダーの端に配置する赤い小箱を作成
    const markerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    // シリンダーの半径が1なので、少し外側に配置（x軸方向）
    marker.position.set(1.1, 0, 0);
    group.add(marker);

    scene.add(group);

    return { objects: [group], geometries: [cylinderGeometry, markerGeometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    // グループ全体をY軸回転させる
    objects[0].rotation.y += deltaTime * 2;
  }

  async init() {
    const { objects } = GeometryShowcase004.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase004.updateObjects(
      Array.from(this.objects),
      this.time,
      deltaTime
    );
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
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
