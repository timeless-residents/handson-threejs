import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase018 extends UseCaseBase {
  static metadata = {
    id: "018",
    title: "Night City Windows Effect",
    description:
      "Building with emissive lights resembling night cityscape windows",
    categories: ["Geometry", "Animation", "Lighting", "Cityscape"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.windowLights = [];
  }

  static setupScene(scene) {
    // 背景を黒に設定
    scene.background = new THREE.Color(0x000000);

    // ライトの設定
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // 月光のような青みがかった弱い指向性ライト
    const moonLight = new THREE.DirectionalLight(0x8888ff, 0.2);
    moonLight.position.set(10, 8, 5);
    scene.add(moonLight);

    const objects = [];
    const geometries = [];
    const windowLights = [];

    // 複数の建物を作成
    const buildingCount = 15;

    for (let i = 0; i < buildingCount; i++) {
      // 建物パラメータをランダム化
      const width = 0.4 + Math.random() * 0.6;
      const depth = 0.4 + Math.random() * 0.6;
      const height = 1 + Math.random() * 4;

      // グリッド位置を計算
      const col = i % Math.sqrt(buildingCount);
      const row = Math.floor(i / Math.sqrt(buildingCount));

      // グリッド内で位置をランダム化
      const x =
        (col - Math.sqrt(buildingCount) / 2) * 1.5 +
        (Math.random() * 0.5 - 0.25);
      const z =
        (row - Math.sqrt(buildingCount) / 2) * 1.5 +
        (Math.random() * 0.5 - 0.25);

      // 建物ジオメトリ作成
      const geometry = new THREE.BoxGeometry(width, height, depth);

      // 建物マテリアル作成 - 暗めの色
      const material = new THREE.MeshPhongMaterial({
        color: 0x222222,
        shininess: 0,
        specular: 0x000000,
      });

      const building = new THREE.Mesh(geometry, material);
      building.position.set(x, height / 2, z);

      scene.add(building);
      objects.push(building);
      geometries.push(geometry);

      // この建物の窓を生成
      const buildingWindows = createWindowsForBuilding(building, scene);
      windowLights.push(...buildingWindows);
    }

    // 地面を作成
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 0,
      specular: 0x000000,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);
    objects.push(ground);
    geometries.push(groundGeometry);

    return { objects, geometries, windowLights };
  }

  static updateObjects(objects, windowLights, time) {
    // 窓の点滅を更新
    if (windowLights && Array.isArray(windowLights)) {
      windowLights.forEach((windowLight, index) => {
        // ランダムに点滅
        if (Math.random() < 0.01) {
          // 現在の状態を反転
          if (windowLight.material.opacity > 0.5) {
            // 消灯
            windowLight.material.opacity = Math.random() * 0.2;
          } else {
            // 点灯
            windowLight.material.opacity = 0.5 + Math.random() * 0.5;

            // 色を時々変更
            if (Math.random() < 0.3) {
              const colorType = Math.random();
              if (colorType < 0.7) {
                // 暖色系
                windowLight.material.color.setHSL(0.1, 0.8, 0.6);
              } else if (colorType < 0.9) {
                // 青白色
                windowLight.material.color.setHSL(0.6, 0.8, 0.6);
              } else {
                // 特殊色（赤やアクセント）
                windowLight.material.color.setHSL(Math.random(), 0.9, 0.7);
              }
            }
          }
        }

        // 輝度を時間によって少し変動させる
        const pulseIntensity = 0.8 + Math.sin(time * 2 + index) * 0.2;
        // MeshBasicMaterialはemissiveIntensityプロパティを持たないので、
        // 代わりに不透明度を変えて明るさを変動させる
        const currentOpacity = windowLight.material.opacity;
        if (currentOpacity > 0.3) {
          // 点灯している窓のみ
          windowLight.material.opacity = currentOpacity * pulseIntensity;
        }
      });
    }

    // 建物をわずかに揺らす
    if (objects && Array.isArray(objects)) {
      objects.forEach((object, index) => {
        if (index < objects.length - 1) {
          // 地面は除外
          object.position.y += Math.sin(time * 0.5 + index) * 0.0005;
        }
      });
    }
  }

  async init() {
    const { objects, windowLights } = GeometryShowcase018.setupScene(
      this.scene
    );
    objects.forEach((obj) => this.objects.add(obj));
    this.windowLights = windowLights;
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase018.updateObjects(
      Array.from(this.objects),
      this.windowLights,
      this.time
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 5, 8],
      target: [0, 1, 0],
    };
  }

  static getThumbnailBlob() {
    // サムネイル画像をBase64エンコードされた文字列として返す
    // これはビル型オブジェクトが光る窓を持つ単純なSVG画像
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#000000"/>
        <rect x="50" y="40" width="30" height="120" fill="#222222"/>
        <rect x="90" y="80" width="20" height="80" fill="#222222"/>
        <rect x="120" y="60" width="40" height="100" fill="#222222"/>
        
        <!-- Window Lights -->
        <rect x="55" y="50" width="5" height="5" fill="#ffcc66" opacity="0.9"/>
        <rect x="65" y="50" width="5" height="5" fill="#ffcc66" opacity="0.8"/>
        <rect x="55" y="70" width="5" height="5" fill="#ffcc66" opacity="0.7"/>
        <rect x="65" y="70" width="5" height="5" fill="#ffcc66" opacity="0.9"/>
        <rect x="55" y="90" width="5" height="5" fill="#8899ff" opacity="0.8"/>
        <rect x="65" y="90" width="5" height="5" fill="#ffcc66" opacity="0.6"/>
        <rect x="55" y="110" width="5" height="5" fill="#ffcc66" opacity="0.9"/>
        <rect x="65" y="110" width="5" height="5" fill="#ffcc66" opacity="0.7"/>
        <rect x="55" y="130" width="5" height="5" fill="#ffcc66" opacity="0.8"/>
        <rect x="65" y="130" width="5" height="5" fill="#8899ff" opacity="0.9"/>
        
        <rect x="95" y="90" width="4" height="4" fill="#ffcc66" opacity="0.9"/>
        <rect x="95" y="105" width="4" height="4" fill="#ffcc66" opacity="0.7"/>
        <rect x="95" y="120" width="4" height="4" fill="#8899ff" opacity="0.8"/>
        <rect x="95" y="135" width="4" height="4" fill="#ffcc66" opacity="0.6"/>
        
        <rect x="130" y="70" width="5" height="5" fill="#ffcc66" opacity="0.8"/>
        <rect x="142" y="70" width="5" height="5" fill="#ffcc66" opacity="0.9"/>
        <rect x="130" y="85" width="5" height="5" fill="#8899ff" opacity="0.7"/>
        <rect x="142" y="85" width="5" height="5" fill="#ffcc66" opacity="0.8"/>
        <rect x="130" y="100" width="5" height="5" fill="#ffcc66" opacity="0.9"/>
        <rect x="142" y="100" width="5" height="5" fill="#ffcc66" opacity="0.6"/>
        <rect x="130" y="115" width="5" height="5" fill="#ffcc66" opacity="0.7"/>
        <rect x="142" y="115" width="5" height="5" fill="#8899ff" opacity="0.9"/>
        <rect x="130" y="130" width="5" height="5" fill="#ffcc66" opacity="0.8"/>
        <rect x="142" y="130" width="5" height="5" fill="#ffcc66" opacity="0.7"/>
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
    renderer.shadowMap.enabled = true;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 1, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const { objects, geometries, windowLights } = this.setupScene(scene);
    let time = 0;

    const animate = () => {
      time += 0.016;
      this.updateObjects(objects, windowLights, time);
      renderer.render(scene, camera);
    };

    // 初期レンダリング
    animate();

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, windowLights, time);
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
        windowLights.forEach((light) => {
          if (light.material) light.material.dispose();
          if (light.geometry) light.geometry.dispose();
        });
        renderer.dispose();
      },
    };
  }
}

// 建物の窓を生成するヘルパー関数
function createWindowsForBuilding(building, scene) {
  const windowLights = [];
  const buildingSize = new THREE.Vector3();
  new THREE.Box3().setFromObject(building).getSize(buildingSize);

  // 窓の数を決定
  const windowColumns = Math.ceil(buildingSize.x * 10);
  const windowRows = Math.ceil(buildingSize.y * 5);
  const windowDepth = Math.ceil(buildingSize.z * 10);

  // 窓の配置用パラメータ
  const windowWidth = buildingSize.x * 0.1;
  const windowHeight = buildingSize.y * 0.05;
  const offsetX = buildingSize.x / 2 - windowWidth / 2;
  const offsetY = buildingSize.y / 2 - windowHeight / 2;
  const offsetZ = buildingSize.z / 2 - windowWidth / 2;

  // 窓のマテリアルを一度だけ作成（最適化のため）
  const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);

  // 4面分の窓を生成（前面、背面、左面、右面）
  const sides = [
    { axis: "z", sign: 1, rotate: [0, 0, 0] },
    { axis: "z", sign: -1, rotate: [0, Math.PI, 0] },
    { axis: "x", sign: 1, rotate: [0, Math.PI / 2, 0] },
    { axis: "x", sign: -1, rotate: [0, -Math.PI / 2, 0] },
  ];

  // 各面について窓を生成
  sides.forEach((side) => {
    const rows = side.axis === "z" ? windowRows : windowRows;
    const columns = side.axis === "z" ? windowColumns : windowDepth;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // 窓をランダムに配置（すべての可能な位置に窓があるわけではない）
        if (Math.random() < 0.4) {
          // 窓の輝度と不透明度
          const brightness = 0.5 + Math.random() * 0.5;
          const opacity =
            Math.random() < 0.7
              ? 0.8 + Math.random() * 0.2
              : 0.1 + Math.random() * 0.2;

          // 窓の色
          const colorType = Math.random();
          const hue =
            colorType < 0.7 ? 0.1 : colorType < 0.9 ? 0.6 : Math.random();
          const saturation = 0.8;
          const lightness = 0.6;

          // 発光マテリアル - MeshBasicMaterialを使用
          const windowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, saturation, lightness),
            side: THREE.FrontSide,
            transparent: true,
            opacity: opacity,
          });

          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

          // 窓の位置を計算
          const x =
            side.axis === "z"
              ? (col / columns) * buildingSize.x - offsetX
              : side.sign * (buildingSize.z / 2 + 0.01);

          const y = (row / rows) * buildingSize.y - offsetY;

          const z =
            side.axis === "x"
              ? (col / columns) * buildingSize.z - offsetZ
              : side.sign * (buildingSize.x / 2 + 0.01);

          // 建物の位置を基準に窓の位置を設定
          windowMesh.position.set(
            building.position.x + x,
            building.position.y + y,
            building.position.z + z
          );

          // 面の方向に応じて回転
          windowMesh.rotation.set(
            side.rotate[0],
            side.rotate[1],
            side.rotate[2]
          );

          scene.add(windowMesh);
          windowLights.push(windowMesh);
        }
      }
    }
  });

  return windowLights;
}
