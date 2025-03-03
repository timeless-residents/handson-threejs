import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase022 extends UseCaseBase {
  static metadata = {
    id: "022",
    title: "Curved Tunnel",
    description:
      "弧を描いたカーブに沿って配列した円柱でトンネルを作り、カメラを通過させる",
    categories: ["Geometry", "Animation", "Camera"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
    this.cameraPath = null;
    this.cameraPathLength = 0;
    this.cameraSpeed = 0.05; // カメラの移動速度（遅くして体験を長く）
    this.markerProgress = 0; // マーカーの進行度（0～1）
    this.originalCameraPosition = null;
    this.originalCameraTarget = null;
    this.tunnelRadius = 1.5; // トンネルの半径
    this.tunnelSegments = 50; // トンネルのセグメント数
    this.cylinderHeight = 0.5; // 各円柱の高さ
    this.cylinderRadius = 0.2; // 各円柱の半径
    this.cylindersPerRing = 12; // 一つの輪を構成する円柱の数
    this.isAnimating = false; // アニメーション中かどうか
    this.lastReportedProgress = -1; // 最後に報告した進行状況
  }

  static setupScene(scene) {
    // シーンの背景色を設定（少し明るく）
    scene.background = new THREE.Color(0x111122);

    const objects = [];
    const geometries = [];

    // 環境光を追加（明るさを上げる）
    const ambientLight = new THREE.AmbientLight(0x666666, 1.5);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // 点光源を追加（トンネル内の照明、明るさを上げる）
    const pointLights = [];
    const lightColors = [0xff5555, 0x55ff55, 0x5555ff, 0xffff55, 0xff55ff];

    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight(
        lightColors[i % lightColors.length],
        2,
        15
      );
      light.position.set(
        Math.sin(i * Math.PI * 0.4) * 3,
        Math.cos(i * Math.PI * 0.4) * 2,
        i * 5 - 10
      );
      scene.add(light);
      objects.push(light);
      pointLights.push(light);
    }

    // カーブパスを作成
    const curvePoints = [];
    for (let i = 0; i <= 10; i++) {
      // 螺旋状のパスを作成
      const t = i / 10;
      const x = Math.sin(t * Math.PI * 2) * 5;
      const y = Math.cos(t * Math.PI * 2) * 5;
      const z = -i * 5; // 奥に向かって伸びる
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const curvePath = new THREE.CatmullRomCurve3(curvePoints);

    // トンネルを構成する円柱を作成
    const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
    geometries.push(cylinderGeometry);

    // マテリアルを作成（複数の色を用意、より明るい色に）
    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0x6666ff,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x222266,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x66ff66,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x226622,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xff6666,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x662222,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x66ffff,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x226666,
      }),
    ];

    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);
    objects.push(tunnelGroup);

    // トンネルのセグメントごとに円柱の輪を作成
    for (let i = 0; i < 50; i++) {
      const t = i / 49; // 0～1の範囲
      const position = curvePath.getPoint(t);

      // 次の点を取得して方向ベクトルを計算
      const nextT = Math.min(t + 0.01, 1);
      const nextPosition = curvePath.getPoint(nextT);
      const direction = new THREE.Vector3()
        .subVectors(nextPosition, position)
        .normalize();

      // 円柱を配置する円周上の位置を計算
      for (let j = 0; j < 12; j++) {
        const angle = (j / 12) * Math.PI * 2;

        // 方向ベクトルに垂直な平面上の点を計算
        const perpVector = new THREE.Vector3(0, 1, 0);
        if (Math.abs(direction.y) > 0.99) {
          perpVector.set(1, 0, 0);
        }

        // 方向ベクトルに垂直なベクトルを計算
        const sideVector = new THREE.Vector3()
          .crossVectors(direction, perpVector)
          .normalize();
        const upVector = new THREE.Vector3()
          .crossVectors(sideVector, direction)
          .normalize();

        // 円周上の位置を計算
        const radius = 1.5; // トンネルの半径
        const ringPosition = new THREE.Vector3()
          .copy(position)
          .add(sideVector.clone().multiplyScalar(Math.cos(angle) * radius))
          .add(upVector.clone().multiplyScalar(Math.sin(angle) * radius));

        // 円柱を作成
        const cylinder = new THREE.Mesh(
          cylinderGeometry,
          materials[j % materials.length]
        );

        // 円柱の位置を設定
        cylinder.position.copy(ringPosition);

        // 円柱の向きを設定（中心から外側に向ける）
        const cylinderDirection = new THREE.Vector3()
          .subVectors(ringPosition, position)
          .normalize();
        cylinder.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          cylinderDirection
        );

        // 円柱をグループに追加
        tunnelGroup.add(cylinder);
      }
    }

    // カーブパスの可視化（カメラの動きを分かりやすくするため表示する）
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(
      curvePath.getPoints(100)
    );
    const curveMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
    });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);
    objects.push(curveLine);
    geometries.push(curveGeometry);

    // トンネルを通過するマーカー（黄色い球体）を作成
    const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0x666600,
      emissiveIntensity: 0.5,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    // マーカーに小さな光源を追加して周囲を照らす
    const markerLight = new THREE.PointLight(0xffff00, 1, 5);
    markerLight.position.set(0, 0, 0);
    marker.add(markerLight);

    scene.add(marker);
    objects.push(marker);
    geometries.push(markerGeometry);

    return {
      objects,
      geometries,
      curvePath,
      tunnelGroup,
      pointLights,
      marker,
    };
  }

  static updateObjects(
    objects,
    time = 0,
    mousePos = { x: 0, y: 0 },
    params = {}
  ) {
    const { tunnelGroup, pointLights, curvePath, marker, markerProgress } =
      params;

    if (!tunnelGroup || !pointLights || !curvePath) return;

    // トンネルを少し回転させる
    tunnelGroup.rotation.z = Math.sin(time * 0.2) * 0.05;

    // 光源を動かす
    pointLights.forEach((light, i) => {
      const t = (time * 0.5 + i * 0.2) % 1;
      const position = curvePath.getPoint(t);
      light.position.copy(position);

      // 光の強さを時間によって変化させる（より明るく）
      light.intensity = 2 + Math.sin(time * 2 + i) * 1.0;
    });

    // 個々の円柱を脈動させる
    if (tunnelGroup) {
      tunnelGroup.children.forEach((cylinder, i) => {
        const pulseFactor = Math.sin(time * 2 + i * 0.1) * 0.05 + 1;
        cylinder.scale.set(pulseFactor, 1, pulseFactor);
      });
    }

    // マーカー（黄色い球体）の位置を更新
    if (marker && typeof markerProgress === "number") {
      const position = curvePath.getPoint(markerProgress || 0);
      marker.position.copy(position);

      // マーカーの進行方向を計算
      const lookAheadT = Math.min(markerProgress + 0.05, 0.99);
      const lookAtPoint = curvePath.getPoint(lookAheadT);

      // マーカーが進行方向を向くように回転
      const direction = new THREE.Vector3()
        .subVectors(lookAtPoint, position)
        .normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const matrix = new THREE.Matrix4().lookAt(
        new THREE.Vector3(),
        direction,
        up
      );
      marker.quaternion.setFromRotationMatrix(matrix);
    }
  }

  async init() {
    const { objects, curvePath, tunnelGroup, pointLights, marker } =
      GeometryShowcase022.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));

    this.cameraPath = curvePath;
    this.tunnelGroup = tunnelGroup;
    this.pointLights = pointLights;
    this.marker = marker;

    // main.jsからカメラを取得
    const mainCamera = this.getMainCamera();
    if (mainCamera) {
      console.log("カメラを取得しました:", mainCamera);
      this.originalCameraPosition = mainCamera.position.clone();
      this.originalCameraTarget = new THREE.Vector3(0, 0, 0);
    } else {
      console.warn("カメラが見つかりません");
    }

    // 2秒後にアニメーションを開始
    setTimeout(() => {
      this.startAnimation();
    }, 2000);
  }

  // 直接main.jsのカメラを参照する
  getMainCamera() {
    // グローバルスコープにカメラを公開
    if (!window.globalCamera) {
      // main.jsのカメラ変数を直接参照
      try {
        // グローバルスコープから直接参照
        const mainScript = document.querySelector('script[src*="main.js"]');
        if (mainScript) {
          console.log("main.jsスクリプトが見つかりました");
        }

        // 直接グローバル変数を参照
        if (typeof camera !== "undefined") {
          console.log("グローバルcameraが見つかりました");
          window.globalCamera = camera.camera;
          return camera.camera;
        }

        // window.cameraを参照
        if (window.camera && window.camera.camera) {
          console.log("window.cameraが見つかりました");
          window.globalCamera = window.camera.camera;
          return window.camera.camera;
        }

        // 最後の手段：ダミーカメラを作成
        console.warn("カメラが見つからないため、ダミーカメラを作成します");
        window.globalCamera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        return window.globalCamera;
      } catch (e) {
        console.error("カメラ参照エラー:", e);
        return null;
      }
    }

    return window.globalCamera;
  }

  startAnimation() {
    this.isAnimating = true;
    this.markerProgress = 0;

    // マーカーの初期位置をパスの始点に設定
    if (this.marker && this.cameraPath) {
      const startPoint = this.cameraPath.getPoint(0);
      this.marker.position.copy(startPoint);
    }

    // カメラの視野角を広げる
    const mainCamera = this.getMainCamera();
    if (mainCamera) {
      mainCamera.fov = 80;
      mainCamera.updateProjectionMatrix();
    }

    console.log("アニメーション開始: 黄色い球体がトンネルを通過します");
  }

  resetAnimation() {
    this.isAnimating = false;

    // カメラを元の位置に戻す
    const mainCamera = this.getMainCamera();
    if (mainCamera && this.originalCameraPosition) {
      mainCamera.position.copy(this.originalCameraPosition);
      mainCamera.lookAt(this.originalCameraTarget);

      // カメラの視野角を元に戻す
      mainCamera.fov = 60;
      mainCamera.updateProjectionMatrix();
    }

    console.log("アニメーション終了: 元の位置に戻りました");
  }

  update(deltaTime) {
    this.time += deltaTime;

    // オブジェクトのアップデート
    GeometryShowcase022.updateObjects(
      Array.from(this.objects),
      this.time,
      { x: 0, y: 0 },
      {
        tunnelGroup: this.tunnelGroup,
        pointLights: this.pointLights,
        curvePath: this.cameraPath,
        marker: this.marker,
        markerProgress: this.markerProgress,
      }
    );

    // アニメーション処理：マーカー（黄色い球体）にカメラを追従させるように修正
    if (this.isAnimating && this.cameraPath) {
      // マーカーの進行度を更新
      this.markerProgress += deltaTime * this.cameraSpeed;

      // 一周したらリセット
      if (this.markerProgress >= 1) {
        this.resetAnimation();

        // 3秒後に再度アニメーション開始
        setTimeout(() => {
          this.startAnimation();
        }, 3000);
        return;
      }

      // 進行状況をコンソールに表示（10%ごと）
      const progressPercent = Math.floor(this.markerProgress * 100);
      if (
        progressPercent % 10 === 0 &&
        progressPercent !== this.lastReportedProgress
      ) {
        console.log(`進行状況: ${progressPercent}%`);
        this.lastReportedProgress = progressPercent;
      }

      // マーカーの位置を更新
      const markerPosition = this.cameraPath.getPoint(this.markerProgress);
      this.marker.position.copy(markerPosition);

      // カメラを黄色い球体に追従させる：マーカーの進行方向の接線に沿って配置
      try {
        const mainCamera = this.getMainCamera();
        if (mainCamera) {
          // 少し先のポイントを取得して、進行方向（接線）を計算
          const lookAheadT = Math.min(this.markerProgress + 0.05, 0.99);
          const lookAtPoint = this.cameraPath.getPoint(lookAheadT);
          const direction = new THREE.Vector3()
            .subVectors(lookAtPoint, markerPosition)
            .normalize();

          // カメラのオフセット：進行方向の逆（後方）に一定距離、さらにわずかな垂直オフセットを加える
          const offsetDistance = 3; // 後方の距離（調整可能）
          const verticalOffset = 0.5; // 垂直方向のオフセット（調整可能）
          const cameraOffset = direction
            .clone()
            .multiplyScalar(-offsetDistance);
          cameraOffset.y += verticalOffset;

          // カメラの位置を設定
          mainCamera.position.copy(markerPosition).add(cameraOffset);
          // カメラはマーカーの位置を見る
          mainCamera.lookAt(markerPosition);

          // OrbitControls を無効化（存在する場合）
          if (window.controls) {
            window.controls.enabled = false;
          }

          // プロジェクション行列を更新
          mainCamera.updateProjectionMatrix();

          console.log(
            "カメラ位置更新:",
            mainCamera.position.x.toFixed(2),
            mainCamera.position.y.toFixed(2),
            mainCamera.position.z.toFixed(2),
            "マーカー位置:",
            markerPosition.x.toFixed(2),
            markerPosition.y.toFixed(2),
            markerPosition.z.toFixed(2)
          );
        } else {
          console.warn(
            "カメラが見つからないため、マーカーの位置のみ更新します"
          );
        }
      } catch (e) {
        console.error("カメラ更新エラー:", e);
      }
    }
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 5, 5],
      target: [0, 0, -10],
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
    camera.position.set(8, 5, 5);
    camera.lookAt(0, 0, -10);

    const scene = new THREE.Scene();

    const { objects, geometries, curvePath, tunnelGroup, pointLights, marker } =
      this.setupScene(scene);
    let time = 0;
    let markerProgress = 0;

    const animate = () => {
      time += 0.016;
      this.updateObjects(
        objects,
        time,
        { x: 0, y: 0 },
        { tunnelGroup, pointLights, curvePath, marker, markerProgress }
      );
      renderer.render(scene, camera);
    };

    // 初期レンダリング
    animate();

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        // プレビューでもマーカーを動かす
        markerProgress = (markerProgress + 0.001) % 1;
        this.updateObjects(
          objects,
          time,
          { x: 0, y: 0 },
          { tunnelGroup, pointLights, curvePath, marker, markerProgress }
        );
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
    // シンプルなSVGデータ（アニメーションなし）
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111122"/>
        
        <!-- 螺旋状のトンネルを表現 -->
        <g transform="translate(100, 100)">
          <!-- 奥行きを表現するための同心円 -->
          <circle cx="0" cy="0" r="80" fill="none" stroke="#1a1a3a" stroke-width="2"/>
          <circle cx="0" cy="0" r="70" fill="none" stroke="#1a1a3a" stroke-width="2"/>
          <circle cx="0" cy="0" r="60" fill="none" stroke="#1a1a3a" stroke-width="2"/>
          <circle cx="0" cy="0" r="50" fill="none" stroke="#1a1a3a" stroke-width="2"/>
          <circle cx="0" cy="0" r="40" fill="none" stroke="#1a1a3a" stroke-width="2"/>
          <circle cx="0" cy="0" r="30" fill="none" stroke="#1a1a3a" stroke-width="2"/>
          <circle cx="0" cy="0" r="20" fill="none" stroke="#1a1a3a" stroke-width="2"/>
          
          <!-- トンネルを構成する円柱を表現 -->
          <g>
            <!-- 外側の輪 -->
            <circle cx="60" cy="0" r="5" fill="#6666ff"/>
            <circle cx="42.4" cy="42.4" r="5" fill="#66ff66"/>
            <circle cx="0" cy="60" r="5" fill="#ff6666"/>
            <circle cx="-42.4" cy="42.4" r="5" fill="#66ffff"/>
            <circle cx="-60" cy="0" r="5" fill="#6666ff"/>
            <circle cx="-42.4" cy="-42.4" r="5" fill="#66ff66"/>
            <circle cx="0" cy="-60" r="5" fill="#ff6666"/>
            <circle cx="42.4" cy="-42.4" r="5" fill="#66ffff"/>
            
            <!-- 中間の輪 -->
            <circle cx="40" cy="0" r="4" fill="#6666ff" opacity="0.8"/>
            <circle cx="28.3" cy="28.3" r="4" fill="#66ff66" opacity="0.8"/>
            <circle cx="0" cy="40" r="4" fill="#ff6666" opacity="0.8"/>
            <circle cx="-28.3" cy="28.3" r="4" fill="#66ffff" opacity="0.8"/>
            <circle cx="-40" cy="0" r="4" fill="#6666ff" opacity="0.8"/>
            <circle cx="-28.3" cy="-28.3" r="4" fill="#66ff66" opacity="0.8"/>
            <circle cx="0" cy="-40" r="4" fill="#ff6666" opacity="0.8"/>
            <circle cx="28.3" cy="-28.3" r="4" fill="#66ffff" opacity="0.8"/>
            
            <!-- 内側の輪 -->
            <circle cx="20" cy="0" r="3" fill="#6666ff" opacity="0.7"/>
            <circle cx="14.1" cy="14.1" r="3" fill="#66ff66" opacity="0.7"/>
            <circle cx="0" cy="20" r="3" fill="#ff6666" opacity="0.7"/>
            <circle cx="-14.1" cy="14.1" r="3" fill="#66ffff" opacity="0.7"/>
            <circle cx="-20" cy="0" r="3" fill="#6666ff" opacity="0.7"/>
            <circle cx="-14.1" cy="-14.1" r="3" fill="#66ff66" opacity="0.7"/>
            <circle cx="0" cy="-20" r="3" fill="#ff6666" opacity="0.7"/>
            <circle cx="14.1" cy="-14.1" r="3" fill="#66ffff" opacity="0.7"/>
          </g>
          
          <!-- 中心の光源 -->
          <circle cx="0" cy="0" r="6" fill="white" opacity="0.8"/>
          
          <!-- 黄色い球体（マーカー）- 固定位置 -->
          <circle cx="40" cy="0" r="6" fill="#ffff00"/>
          
          <!-- カメラ（マーカーの後ろに配置）- 固定位置 -->
          <circle cx="50" cy="-5" r="3" fill="#ffffff" opacity="0.7"/>
        </g>
      </svg>
    `;

    // Unicode対応のためのエンコード
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // Promiseを確実に返す
    return fetch(dataURL).then((res) => res.blob());
  }
}
