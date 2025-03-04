import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase024 extends UseCaseBase {
  static metadata = {
    id: "024",
    title: "Cup-like Object",
    description:
      "円柱を作り、上端だけスケールダウンしてコップ風オブジェクトを作成",
    categories: ["Geometry", "Modification", "Custom"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
    this.rotationSpeed = 0.5;
  }

  static setupScene(scene) {
    // 背景色を設定
    scene.background = new THREE.Color(0x222222);

    const objects = [];
    const geometries = [];

    // 環境光を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // メインの光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    objects.push(directionalLight);

    // 反対側からの光源
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 3, -5);
    scene.add(backLight);
    objects.push(backLight);

    // コップのジオメトリを作成
    const cupGeometry = this.createCupGeometry(1, 2, 32);
    geometries.push(cupGeometry);

    // マテリアルを作成（半透明のガラス風）
    const cupMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    // コップのメッシュを作成
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.castShadow = true;
    cup.receiveShadow = true;
    scene.add(cup);
    objects.push(cup);

    // 床を追加
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    geometries.push(floorGeometry);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);
    objects.push(floor);

    return { objects, geometries, cup };
  }

  // コップ形状のカスタムジオメトリを作成するメソッド
  static createCupGeometry(radius, height, segments) {
    // 基本の円柱ジオメトリを作成
    const cylinderGeometry = new THREE.CylinderGeometry(
      radius, // 上部の半径
      radius, // 下部の半径
      height, // 高さ
      segments, // 円周の分割数
      1, // 高さ方向の分割数
      true // 上下の蓋を開ける
    );

    // 上部の頂点をスケールダウンするための係数
    const topScaleFactor = 0.7;

    // 頂点位置を取得
    const positions = cylinderGeometry.attributes.position.array;

    // 上部の頂点を特定してスケールダウン
    for (let i = 0; i < positions.length; i += 3) {
      // Y座標が上部（高さの半分）に近い頂点を特定
      if (positions[i + 1] > height / 2 - 0.01) {
        // X座標とZ座標をスケールダウン
        positions[i] *= topScaleFactor; // X
        positions[i + 2] *= topScaleFactor; // Z
      }
    }

    // 法線を再計算
    cylinderGeometry.computeVertexNormals();

    // 底面を追加
    const bottomGeometry = new THREE.CircleGeometry(radius, segments);
    bottomGeometry.rotateX(Math.PI / 2);
    bottomGeometry.translate(0, -height / 2, 0);

    // 上面を追加（スケールダウンした半径で）
    const topGeometry = new THREE.CircleGeometry(
      radius * topScaleFactor,
      segments
    );
    topGeometry.rotateX(-Math.PI / 2);
    topGeometry.translate(0, height / 2, 0);

    // ジオメトリをマージ
    const mergedGeometry = this.mergeGeometries([
      cylinderGeometry,
      bottomGeometry,
      topGeometry,
    ]);

    return mergedGeometry;
  }

  // ジオメトリをマージするヘルパーメソッド
  static mergeGeometries(geometries) {
    const mergedGeometry = new THREE.BufferGeometry();

    let vertexCount = 0;
    let indexCount = 0;

    // 頂点数とインデックス数を計算
    geometries.forEach((geometry) => {
      vertexCount += geometry.attributes.position.count;
      if (geometry.index) {
        indexCount += geometry.index.count;
      }
    });

    // 新しい配列を作成
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    let indices = null;

    if (indexCount > 0) {
      // インデックスの型を決定（頂点数に応じて）
      const indexType = vertexCount > 65535 ? Uint32Array : Uint16Array;
      indices = new indexType(indexCount);
    }

    let vertexOffset = 0;
    let indexOffset = 0;

    // 各ジオメトリのデータをマージ
    geometries.forEach((geometry) => {
      const positionAttr = geometry.attributes.position;
      const normalAttr = geometry.attributes.normal;
      const uvAttr = geometry.attributes.uv;
      const index = geometry.index;

      // 頂点位置をコピー
      for (let i = 0; i < positionAttr.count; i++) {
        positions[(vertexOffset + i) * 3] = positionAttr.array[i * 3];
        positions[(vertexOffset + i) * 3 + 1] = positionAttr.array[i * 3 + 1];
        positions[(vertexOffset + i) * 3 + 2] = positionAttr.array[i * 3 + 2];
      }

      // 法線をコピー
      if (normalAttr) {
        for (let i = 0; i < normalAttr.count; i++) {
          normals[(vertexOffset + i) * 3] = normalAttr.array[i * 3];
          normals[(vertexOffset + i) * 3 + 1] = normalAttr.array[i * 3 + 1];
          normals[(vertexOffset + i) * 3 + 2] = normalAttr.array[i * 3 + 2];
        }
      }

      // UVをコピー
      if (uvAttr) {
        for (let i = 0; i < uvAttr.count; i++) {
          uvs[(vertexOffset + i) * 2] = uvAttr.array[i * 2];
          uvs[(vertexOffset + i) * 2 + 1] = uvAttr.array[i * 2 + 1];
        }
      }

      // インデックスをコピー（頂点オフセットを加算）
      if (index) {
        for (let i = 0; i < index.count; i++) {
          indices[indexOffset + i] = index.array[i] + vertexOffset;
        }
        indexOffset += index.count;
      }

      vertexOffset += positionAttr.count;
    });

    // 属性を設定
    mergedGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    mergedGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(normals, 3)
    );
    mergedGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    if (indices) {
      mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    return mergedGeometry;
  }

  static updateObjects(
    objects,
    time = 0,
    mousePos = { x: 0, y: 0 },
    params = {}
  ) {
    const { cup } = params;

    if (cup) {
      // コップを回転
      cup.rotation.y = time * 0.5;

      // 少し傾ける
      cup.rotation.x = Math.sin(time * 0.3) * 0.2;
      cup.rotation.z = Math.cos(time * 0.2) * 0.1;
    }
  }

  async init() {
    const { objects, cup } = GeometryShowcase024.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.cup = cup;
  }

  update(deltaTime) {
    this.time += deltaTime * this.rotationSpeed;

    GeometryShowcase024.updateObjects(
      Array.from(this.objects),
      this.time,
      { x: 0, y: 0 },
      { cup: this.cup }
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [3, 2, 3],
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
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    const { objects, geometries, cup } = this.setupScene(scene);
    let time = 0;

    const animate = () => {
      time += 0.016;
      this.updateObjects(objects, time, { x: 0, y: 0 }, { cup });
      renderer.render(scene, camera);
    };

    // 初期レンダリング
    animate();

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, time, { x: 0, y: 0 }, { cup });
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
    console.log("CupLikeObject.getThumbnailBlob が呼ばれました");
    // SVGデータ - コップ風オブジェクトを表現
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#222222"/>
        
        <!-- 背景のグラデーション -->
        <defs>
          <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#88ccff" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#4488cc" stop-opacity="0.6"/>
          </linearGradient>
        </defs>
        
        <!-- 床 -->
        <rect x="20" y="150" width="160" height="30" fill="#444444" rx="2"/>
        
        <!-- コップの底面（楕円） -->
        <ellipse cx="100" cy="140" rx="40" ry="15" fill="#6699cc" opacity="0.7"/>
        
        <!-- コップの本体（台形） -->
        <path d="M60,140 L70,60 L130,60 L140,140 Z" fill="url(#cupGradient)" opacity="0.6" stroke="#88ccff" stroke-width="1"/>
        
        <!-- コップの上面（楕円） -->
        <ellipse cx="100" cy="60" rx="30" ry="10" fill="#88ccff" opacity="0.5"/>
        
        <!-- ハイライト -->
        <path d="M80,120 C85,100 95,90 110,80" stroke="white" stroke-width="2" fill="none" opacity="0.3"/>
        <path d="M90,130 C95,110 100,100 105,90" stroke="white" stroke-width="1" fill="none" opacity="0.2"/>
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
