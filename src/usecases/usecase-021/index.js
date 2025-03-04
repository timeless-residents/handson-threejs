import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

// ねじれたキャンディスティックを作成する関数（モジュールレベルで定義）
function createTwistedCandyStick(
  color1,
  color2,
  twistCount = 8,
  radius = 0.3,
  height = 4
) {
  const group = new THREE.Group();

  // 基本の円柱形状を作成（セグメント数を多めにして滑らかに）
  const geometry = new THREE.CylinderGeometry(
    radius, // 上部の半径
    radius, // 下部の半径
    height, // 高さ
    32, // 円周方向の分割数
    Math.max(64, twistCount * 8), // 高さ方向の分割数（ツイスト数に比例）
    false // 側面のみ（底面なし）
  );

  // 頂点位置を取得して変形を適用
  const positionAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  // 縞模様を作るために、各頂点に色を割り当てる
  const colors = [];

  for (let i = 0; i < positionAttribute.count; i++) {
    // 現在の頂点の座標を取得
    vertex.fromBufferAttribute(positionAttribute, i);

    // 頂点のY座標を正規化（-0.5から0.5の範囲に）
    const normalizedY = vertex.y / height;

    // ツイストの角度を計算（Y座標によって変わる）
    // 中央付近でよりねじれるようにする
    let twistFactor;
    if (normalizedY > 0.2 && normalizedY < 0.8) {
      // 中央部分は強くねじる
      twistFactor = Math.sin(normalizedY * Math.PI) * twistCount * Math.PI;
    } else {
      // 端の部分はあまりねじらない
      twistFactor = 0;
    }

    // ツイストを適用
    const x = vertex.x;
    const z = vertex.z;
    const cosTheta = Math.cos(twistFactor);
    const sinTheta = Math.sin(twistFactor);

    vertex.x = x * cosTheta - z * sinTheta;
    vertex.z = x * sinTheta + z * cosTheta;

    // 変形した座標を設定
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);

    // 縞模様のために色を決定（角度に基づく）
    const angle = Math.atan2(vertex.z, vertex.x);
    const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0～1に正規化

    // ツイストに合わせた縞模様
    const adjustedAngle = normalizedAngle + twistFactor / (Math.PI * 2);
    const colorIndex = Math.floor(adjustedAngle * 12) % 2; // 6分割して交互に色を変える

    // 色を設定
    if (colorIndex === 0) {
      colors.push(
        ((color1 >> 16) & 255) / 255,
        ((color1 >> 8) & 255) / 255,
        (color1 & 255) / 255
      );
    } else {
      colors.push(
        ((color2 >> 16) & 255) / 255,
        ((color2 >> 8) & 255) / 255,
        (color2 & 255) / 255
      );
    }
  }

  // BufferAttributeとして色を設定
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // 法線を再計算
  geometry.computeVertexNormals();

  // 頂点カラーを使用するマテリアル
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.3,
    metalness: 0.3,
  });

  // メッシュを作成
  const candyStick = new THREE.Mesh(geometry, material);
  candyStick.castShadow = true;
  candyStick.receiveShadow = true;

  // 両端に半球を追加して丸くする
  const sphereGeometryTop = new THREE.SphereGeometry(
    radius,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const sphereTop = new THREE.Mesh(sphereGeometryTop, material.clone());
  sphereTop.position.y = height / 2;
  sphereTop.rotation.x = Math.PI;

  const sphereGeometryBottom = new THREE.SphereGeometry(
    radius,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const sphereBottom = new THREE.Mesh(sphereGeometryBottom, material.clone());
  sphereBottom.position.y = -height / 2;

  // グループに追加
  group.add(candyStick);
  group.add(sphereTop);
  group.add(sphereBottom);

  return group;
}

export default class GeometryShowcase021 extends UseCaseBase {
  static metadata = {
    id: "021",
    title: "Twisted Candy Stick",
    description:
      "部分的にTwist（シンプルデフォーム）でねじれた円柱を使ったキャンディスティック風オブジェクト",
    categories: ["Geometry", "Deformation", "Candy"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.candySticks = [];
    this.rotationSpeed = 0.5;
  }

  static setupScene(scene) {
    // シーンの背景色を設定（明るい色）
    scene.background = new THREE.Color(0xf0f0f0);

    const objects = [];
    const geometries = [];

    // 環境光を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // メインの光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    objects.push(mainLight);

    // サブライト（反対側からの光）
    const subLight = new THREE.DirectionalLight(0xffffff, 0.4);
    subLight.position.set(-5, 3, -5);
    scene.add(subLight);
    objects.push(subLight);

    // 複数のキャンディスティックを作成
    const candySticks = [];
    const colors = [
      [0xff0000, 0xffffff], // 赤と白
      [0x00ff00, 0xffffff], // 緑と白
      [0x0000ff, 0xffffff], // 青と白
      [0xff0000, 0x00ff00], // 赤と緑
      [0xff00ff, 0xffffff], // ピンクと白
    ];

    // 5本のキャンディスティックを作成し、円形に配置
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const candyStick = createTwistedCandyStick(
        colors[i][0],
        colors[i][1],
        8 + i
      );
      candyStick.position.set(x, 0, z);
      candyStick.rotation.x = Math.PI / 8; // 少し傾ける
      candyStick.rotation.y = angle + Math.PI / 2; // キャンディを外側に向ける

      scene.add(candyStick);
      objects.push(candyStick);
      candySticks.push(candyStick);
    }

    // 中央に特別な大きなキャンディを配置
    const centerCandy = createTwistedCandyStick(0xff4500, 0xffffff, 12, 0.8, 6);
    centerCandy.position.set(0, 0, 0);
    centerCandy.rotation.x = -Math.PI / 4; // 大きく傾ける
    scene.add(centerCandy);
    objects.push(centerCandy);
    candySticks.push(centerCandy);

    return {
      objects,
      geometries,
      candySticks,
    };
  }

  static updateObjects(objects, time = 0, mousePos = { x: 0, y: 0 }) {
    // objects配列から回転させたいオブジェクトを探す
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (!obj || !obj.rotation) continue;

      // キャンディスティックっぽいオブジェクトは回転させる
      if (obj.isMesh || obj.isGroup) {
        // 中央に近いオブジェクトは逆方向に回転
        if (Math.abs(obj.position.x) < 1 && Math.abs(obj.position.z) < 1) {
          obj.rotation.y -= 0.005;
        } else {
          // 外周のオブジェクトはゆらゆら揺れる
          const angle = Math.atan2(obj.position.z, obj.position.x);
          obj.rotation.y = angle + Math.PI / 2 + Math.sin(time * 0.3 + i) * 0.1;

          // 上下に揺らす
          obj.position.y = Math.sin(time * 0.5 + i * 0.7) * 0.2;
        }
      }
    }
  }

  async init() {
    const { objects, candySticks } = GeometryShowcase021.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.candySticks = candySticks;
  }

  update(deltaTime) {
    this.time += deltaTime * this.rotationSpeed;
    GeometryShowcase021.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [6, 4, 6],
      target: [0, 0, 0],
    };
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
    camera.position.set(6, 4, 6);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    const { objects, geometries, candySticks } = this.setupScene(scene);
    let time = 0;

    const animate = () => {
      time += 0.016;
      this.updateObjects(objects, time);
      renderer.render(scene, camera);
    };

    // 初期レンダリング
    animate();

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, time);
        renderer.render(scene, camera);
      },
      dispose: () => {
        geometries.forEach((g) => g?.dispose());
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

  static getThumbnailBlob() {
    // シンプルなSVGデータ - パターン参照なしに直接色を使用
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0f0f0"/>
        
        <!-- 中央の大きなキャンディ -->
        <g transform="translate(100, 100) rotate(-40)">
          <rect x="-8" y="-60" width="8" height="120" rx="8" fill="#ff4500" />
          <rect x="0" y="-60" width="8" height="120" rx="8" fill="#ffffff" />
        </g>
        
        <!-- 周りの小さなキャンディ -->
        <g transform="translate(60, 100) rotate(20)">
          <rect x="-5" y="-40" width="5" height="80" rx="5" fill="#ff0000" />
          <rect x="0" y="-40" width="5" height="80" rx="5" fill="#ffffff" />
        </g>
        <g transform="translate(140, 100) rotate(-20)">
          <rect x="-5" y="-40" width="5" height="80" rx="5" fill="#00ff00" />
          <rect x="0" y="-40" width="5" height="80" rx="5" fill="#ffffff" />
        </g>
        <g transform="translate(100, 50) rotate(90)">
          <rect x="-5" y="-40" width="5" height="80" rx="5" fill="#0000ff" />
          <rect x="0" y="-40" width="5" height="80" rx="5" fill="#ffffff" />
        </g>
        <g transform="translate(100, 150) rotate(90)">
          <rect x="-5" y="-40" width="5" height="80" rx="5" fill="#ff00ff" />
          <rect x="0" y="-40" width="5" height="80" rx="5" fill="#ffffff" />
        </g>
        
        <!-- 光沢効果 -->
        <ellipse cx="100" cy="100" rx="70" ry="70" fill="white" opacity="0.1" />
      </svg>
    `;

    // Unicode対応のためのエンコード
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // 明示的に Promise を返す
    return new Promise((resolve, reject) => {
      fetch(dataURL)
        .then((response) => response.blob())
        .then((blob) => resolve(blob))
        .catch((error) => {
          console.error("Error creating thumbnail blob:", error);
          reject(error);
        });
    });
  }
}
