import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase020 extends UseCaseBase {
  static metadata = {
    id: "020",
    title: "Winter Snow Scene",
    description:
      "雪が降り積もる冬の風景。パーティクルで表現された雪と青い雰囲気の冬シーン",
    categories: ["Particles", "Weather", "Seasonal", "Landscape"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.snowParticles = null;
    this.ground = null;
    this.trees = [];
    this.wind = { x: 0.2, z: 0.1 }; // 風の方向と強さ
  }

  static setupScene(scene) {
    // 薄い青色の背景（冬の空）
    scene.background = new THREE.Color(0xb0c4de);

    // フォグを追加して遠くを霞ませる（雪景色の表現）
    scene.fog = new THREE.FogExp2(0xb0c4de, 0.035);

    const objects = [];
    const geometries = [];

    // 環境光を追加（青みがかった光）
    const ambientLight = new THREE.AmbientLight(0x8899bb, 0.5);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // 太陽光（薄い光）
    const sunLight = new THREE.DirectionalLight(0xffffee, 0.8);
    sunLight.position.set(5, 8, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    scene.add(sunLight);
    objects.push(sunLight);

    // 地面を作成（雪に覆われた地面）
    const groundGeometry = new THREE.PlaneGeometry(30, 30, 32, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    objects.push(ground);
    geometries.push(groundGeometry);

    // 雪の粒子を作成
    const snowCount = 5000;
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowSizes = new Float32Array(snowCount);
    const snowVelocities = []; // 速度を保存するための配列

    // 雪の粒子の初期位置を設定
    for (let i = 0; i < snowCount; i++) {
      // 空間内にランダムに配置
      const x = (Math.random() - 0.5) * 30;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 30;

      snowPositions[i * 3] = x;
      snowPositions[i * 3 + 1] = y;
      snowPositions[i * 3 + 2] = z;

      // 雪の粒子のサイズをランダムに
      snowSizes[i] = 0.05 + Math.random() * 0.15;

      // 雪の落下速度もランダムに（小さい粒子はゆっくり、大きい粒子は速く）
      snowVelocities.push({
        y: -0.01 - Math.random() * 0.03 - snowSizes[i] * 0.1,
        x: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    snowGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(snowPositions, 3)
    );
    snowGeometry.setAttribute("size", new THREE.BufferAttribute(snowSizes, 1));

    // 雪のテクスチャを作成（通常は画像を使用しますが、ここではコードで生成）
    const snowCanvas = document.createElement("canvas");
    snowCanvas.width = 32;
    snowCanvas.height = 32;
    const snowContext = snowCanvas.getContext("2d");
    const gradient = snowContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    snowContext.fillStyle = gradient;
    snowContext.fillRect(0, 0, 32, 32);

    const snowTexture = new THREE.Texture(snowCanvas);
    snowTexture.needsUpdate = true;

    // 雪の粒子マテリアル
    const snowMaterial = new THREE.PointsMaterial({
      size: 0.5,
      map: snowTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
    scene.add(snowParticles);
    objects.push(snowParticles);
    geometries.push(snowGeometry);

    // 木を追加
    const trees = [];
    const treeCount = 15;

    for (let i = 0; i < treeCount; i++) {
      const tree = createTree();

      // ランダムな位置に配置
      const x = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 25;
      const scale = 0.5 + Math.random() * 1;

      tree.position.set(x, 0, z);
      tree.scale.set(scale, scale, scale);

      scene.add(tree);
      objects.push(tree);
      trees.push(tree);
    }

    // 小さな雪の丘を作成
    for (let i = 0; i < 10; i++) {
      const hillGeometry = new THREE.SphereGeometry(
        0.5 + Math.random() * 2, // サイズをランダムに
        16,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2 // 半球形
      );

      const hillMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.1,
      });

      const hill = new THREE.Mesh(hillGeometry, hillMaterial);

      // ランダムな位置に配置
      const x = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 25;

      hill.position.set(x, 0, z);
      hill.castShadow = true;
      hill.receiveShadow = true;

      scene.add(hill);
      objects.push(hill);
      geometries.push(hillGeometry);
    }

    return {
      objects,
      geometries,
      snowParticles,
      snowVelocities,
      ground,
      trees,
    };
  }

  static updateObjects(
    objects,
    snowParticles,
    snowVelocities,
    ground,
    trees,
    time,
    wind = { x: 0.2, z: 0.1 }
  ) {
    if (!snowParticles || !snowVelocities) return;

    // 雪の位置を更新
    const positions = snowParticles.geometry.attributes.position.array;

    for (let i = 0; i < positions.length / 3; i++) {
      // 現在の位置
      let x = positions[i * 3];
      let y = positions[i * 3 + 1];
      let z = positions[i * 3 + 2];

      // 速度に風の影響を加える
      const vx =
        snowVelocities[i].x + wind.x * 0.001 * Math.sin(time * 0.5 + i * 0.1);
      const vy = snowVelocities[i].y;
      const vz =
        snowVelocities[i].z + wind.z * 0.001 * Math.cos(time * 0.5 + i * 0.1);

      // 位置を更新
      x += vx;
      y += vy;
      z += vz;

      // 地面に着いたら、再度上から降らせる
      if (y < 0.05) {
        y = 20;
        x = (Math.random() - 0.5) * 30;
        z = (Math.random() - 0.5) * 30;
      }

      // 範囲外に出たら反対側から
      if (x < -15) x = 15;
      if (x > 15) x = -15;
      if (z < -15) z = 15;
      if (z > 15) z = -15;

      // 更新した位置を設定
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    // 更新された位置をGPUに転送
    snowParticles.geometry.attributes.position.needsUpdate = true;

    // 木を風でわずかに揺らす
    trees.forEach((tree, index) => {
      tree.rotation.z = Math.sin(time * 0.5 + index) * 0.03 * wind.x;
      tree.rotation.x = Math.cos(time * 0.5 + index) * 0.03 * wind.z;
    });
  }

  async init() {
    const { objects, snowParticles, snowVelocities, ground, trees } =
      GeometryShowcase020.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.snowParticles = snowParticles;
    this.snowVelocities = snowVelocities;
    this.ground = ground;
    this.trees = trees;
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase020.updateObjects(
      Array.from(this.objects),
      this.snowParticles,
      this.snowVelocities,
      this.ground,
      this.trees,
      this.time,
      this.wind
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 5, 8],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // サムネイル画像をBase64エンコードされた文字列として返す
    // これは冬の雪景色を表現したSVG画像
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#b0c4de"/>
        
        <!-- Ground (Snow) -->
        <rect x="0" y="150" width="200" height="50" fill="#ffffff"/>
        
        <!-- Snow Hills -->
        <ellipse cx="30" cy="150" rx="25" ry="10" fill="#f0f0f0"/>
        <ellipse cx="140" cy="150" rx="30" ry="12" fill="#f0f0f0"/>
        
        <!-- Tree 1 -->
        <rect x="40" y="120" width="6" height="30" fill="#8b4513"/>
        <polygon points="25,120 65,120 45,90" fill="#2f4f4f"/>
        <polygon points="30,100 60,100 45,75" fill="#2f4f4f"/>
        <polygon points="35,80 55,80 45,60" fill="#2f4f4f"/>
        
        <!-- Tree 2 -->
        <rect x="100" y="100" width="8" height="50" fill="#8b4513"/>
        <polygon points="80,100 130,100 105,65" fill="#2f4f4f"/>
        <polygon points="85,75 125,75 105,45" fill="#2f4f4f"/>
        <polygon points="90,55 120,55 105,30" fill="#2f4f4f"/>
        
        <!-- Tree 3 -->
        <rect x="155" y="110" width="5" height="40" fill="#8b4513"/>
        <polygon points="140,110 175,110 157,85" fill="#2f4f4f"/>
        <polygon points="145,90 170,90 157,70" fill="#2f4f4f"/>
        <polygon points="150,75 165,75 157,55" fill="#2f4f4f"/>
        
        <!-- Snow Particles -->
        <g fill="#ffffff" opacity="0.8">
          <circle cx="20" cy="30" r="1.5" />
          <circle cx="40" cy="50" r="1.2" />
          <circle cx="60" cy="20" r="1.8" />
          <circle cx="80" cy="40" r="1.3" />
          <circle cx="100" cy="10" r="1.7" />
          <circle cx="120" cy="30" r="1.4" />
          <circle cx="140" cy="50" r="1.6" />
          <circle cx="160" cy="20" r="1.2" />
          <circle cx="180" cy="40" r="1.5" />
          <circle cx="30" cy="60" r="1.3" />
          <circle cx="50" cy="80" r="1.2" />
          <circle cx="70" cy="70" r="1.8" />
          <circle cx="90" cy="90" r="1.3" />
          <circle cx="110" cy="60" r="1.7" />
          <circle cx="130" cy="80" r="1.4" />
          <circle cx="150" cy="70" r="1.6" />
          <circle cx="170" cy="90" r="1.2" />
          <circle cx="10" cy="100" r="1.5" />
          <circle cx="30" cy="120" r="1.3" />
          <circle cx="50" cy="110" r="1.2" />
          <circle cx="70" cy="130" r="1.8" />
          <circle cx="170" cy="110" r="1.6" />
          <circle cx="190" cy="130" r="1.2" />
        </g>
      </svg>
    `;

    // Unicode対応のためのエンコード処理
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // Blobオブジェクトに変換して返す
    return fetch(dataURL).then((res) => res.blob());
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 1, 0);

    const scene = new THREE.Scene();

    const {
      objects,
      geometries,
      snowParticles,
      snowVelocities,
      ground,
      trees,
    } = this.setupScene(scene);
    let time = 0;

    const animate = () => {
      time += 0.016;
      this.updateObjects(
        objects,
        snowParticles,
        snowVelocities,
        ground,
        trees,
        time
      );
      renderer.render(scene, camera);
    };

    // 初期レンダリング
    animate();

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(
          objects,
          snowParticles,
          snowVelocities,
          ground,
          trees,
          time
        );
        renderer.render(scene, camera);
      },
      dispose: () => {
        geometries.forEach((g) => g.dispose());
        objects.forEach((obj) => {
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => mat.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        renderer.dispose();
      },
    };
  }
}

// 木を作成するヘルパー関数
function createTree() {
  const treeGroup = new THREE.Group();

  // 幹
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.75;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  // 葉（円錐を重ねる）
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f4f4f, // 暗い緑（冬の松の色）
    roughness: 0.8,
  });

  // 一番下の葉
  const leafGeometry1 = new THREE.ConeGeometry(1, 1.5, 8);
  const leaf1 = new THREE.Mesh(leafGeometry1, leafMaterial);
  leaf1.position.y = 1.5;
  leaf1.castShadow = true;
  treeGroup.add(leaf1);

  // 中間の葉
  const leafGeometry2 = new THREE.ConeGeometry(0.8, 1.2, 8);
  const leaf2 = new THREE.Mesh(leafGeometry2, leafMaterial);
  leaf2.position.y = 2.3;
  leaf2.castShadow = true;
  treeGroup.add(leaf2);

  // 一番上の葉
  const leafGeometry3 = new THREE.ConeGeometry(0.6, 1, 8);
  const leaf3 = new THREE.Mesh(leafGeometry3, leafMaterial);
  leaf3.position.y = 3;
  leaf3.castShadow = true;
  treeGroup.add(leaf3);

  // 雪をのせる（円錐の先端を白く）
  const snowCapGeometry1 = new THREE.ConeGeometry(1.05, 0.2, 8);
  const snowCapMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
  });
  const snowCap1 = new THREE.Mesh(snowCapGeometry1, snowCapMaterial);
  snowCap1.position.y = 1.55;
  treeGroup.add(snowCap1);

  const snowCapGeometry2 = new THREE.ConeGeometry(0.85, 0.2, 8);
  const snowCap2 = new THREE.Mesh(snowCapGeometry2, snowCapMaterial);
  snowCap2.position.y = 2.35;
  treeGroup.add(snowCap2);

  const snowCapGeometry3 = new THREE.ConeGeometry(0.65, 0.2, 8);
  const snowCap3 = new THREE.Mesh(snowCapGeometry3, snowCapMaterial);
  snowCap3.position.y = 3.05;
  treeGroup.add(snowCap3);

  return treeGroup;
}
