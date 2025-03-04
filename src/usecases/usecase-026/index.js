import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase026 extends UseCaseBase {
  static metadata = {
    id: "026",
    title: "Minimal Robot Model",
    description:
      "A minimal robot model created by combining prisms with improved hierarchy, modularity, and resource management",
    categories: ["Geometry", "Animation", "Model"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.robotParts = {};
    // すべてのオブジェクトを格納するグループを作成してシーンに追加
    this.objects = new THREE.Group();
    scene.add(this.objects);
  }

  // アニメーションに関するパラメータ（振幅、速度など）を定数として定義
  static animationParams = {
    bodyRotationSpeed: 0.5,
    bodyRotationAmplitude: 0.2,
    headRotationSpeed: 0.7,
    headRotationAmplitude: 0.3,
    headBobSpeed: 1.5,
    headBobAmplitude: 0.05,
    armSwingSpeed: 1.2,
    armSwingAmplitudeUpper: 0.4,
    armSwingAmplitudeLower: 0.3,
    legSwingSpeed: 1.2,
    legSwingAmplitudeUpper: 0.3,
    legSwingAmplitudeLower: 0.3,
  };

  // ヘルパー：共通のメッシュ作成
  static createMesh(geometry, material, position) {
    const mesh = new THREE.Mesh(geometry, material);
    if (position) {
      mesh.position.copy(position);
    }
    return mesh;
  }

  // 各パーツ作成用の関数（body, head, eye, shoulder, upperArm, elbow, lowerArm, hip, upperLeg, knee, lowerLeg, foot）
  static createBody(material) {
    const geometry = new THREE.BoxGeometry(1.5, 2, 1);
    // body の原点は中央なので、シーン上で位置調整
    const body = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, 1.5, 0)
    );
    body.name = "body";
    return { mesh: body, geometry };
  }

  static createHead(material) {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    // head は body の上部に配置（body の子として後で追加）
    const head = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, 1.6, 0)
    );
    head.name = "head";
    return { mesh: head, geometry };
  }

  static createEye(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
    const eye = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(xOffset, 0.1, 0.55)
    );
    eye.name = xOffset < 0 ? "leftEye" : "rightEye";
    return { mesh: eye, geometry };
  }

  static createShoulder(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const shoulder = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(xOffset, -0.2, 0)
    );
    shoulder.name = xOffset < 0 ? "leftShoulder" : "rightShoulder";
    return { mesh: shoulder, geometry };
  }

  static createUpperArm(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const upperArm = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, -0.8, 0)
    );
    upperArm.name = xOffset < 0 ? "leftUpperArm" : "rightUpperArm";
    return { mesh: upperArm, geometry };
  }

  static createElbow(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const elbow = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, -1.2, 0)
    );
    elbow.name = xOffset < 0 ? "leftElbow" : "rightElbow";
    return { mesh: elbow, geometry };
  }

  static createLowerArm(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const lowerArm = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, -0.7, 0)
    );
    lowerArm.name = xOffset < 0 ? "leftLowerArm" : "rightLowerArm";
    return { mesh: lowerArm, geometry };
  }

  static createHip(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    const hip = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(xOffset, -1, 0)
    );
    hip.name = xOffset < 0 ? "leftHip" : "rightHip";
    return { mesh: hip, geometry };
  }

  static createUpperLeg(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.5, 1.2, 0.5);
    const upperLeg = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, -0.8, 0)
    );
    upperLeg.name = xOffset < 0 ? "leftUpperLeg" : "rightUpperLeg";
    return { mesh: upperLeg, geometry };
  }

  static createKnee(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
    const knee = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, -1.0, 0)
    );
    knee.name = xOffset < 0 ? "leftKnee" : "rightKnee";
    return { mesh: knee, geometry };
  }

  static createLowerLeg(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const lowerLeg = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, -0.9, 0)
    );
    lowerLeg.name = xOffset < 0 ? "leftLowerLeg" : "rightLowerLeg";
    return { mesh: lowerLeg, geometry };
  }

  static createFoot(material, xOffset) {
    const geometry = new THREE.BoxGeometry(0.6, 0.3, 0.8);
    const foot = this.createMesh(
      geometry,
      material,
      new THREE.Vector3(0, -0.45, 0.2)
    );
    foot.name = xOffset < 0 ? "leftFoot" : "rightFoot";
    return { mesh: foot, geometry };
  }

  /**
   * シーンにロボット全体を配置する。
   * 各パーツは適切な親子関係（階層構造）をもって作成される。
   */
  static setupScene(scene) {
    const parts = {};
    const geometries = [];
    const objects = [];

    // マテリアル定義
    const materials = {
      body: new THREE.MeshPhongMaterial({ color: 0x5555ff }),
      limb: new THREE.MeshPhongMaterial({ color: 0x3333cc }),
      head: new THREE.MeshPhongMaterial({ color: 0x7777ff }),
      eye: new THREE.MeshPhongMaterial({ color: 0xff0000 }),
      joint: new THREE.MeshPhongMaterial({ color: 0x222222 }),
    };

    // ロボット全体のグループを作成
    const robotGroup = new THREE.Group();
    robotGroup.name = "robotGroup";
    scene.add(robotGroup);

    // ── Body (胴体) ──
    const { mesh: body, geometry: bodyGeom } = this.createBody(materials.body);
    geometries.push(bodyGeom);
    parts.body = body;
    robotGroup.add(body);
    objects.push(body);

    // ── Head (頭) ──
    const { mesh: head, geometry: headGeom } = this.createHead(materials.head);
    // head は body の子として相対位置で配置
    head.position.set(0, 1.6, 0);
    geometries.push(headGeom);
    parts.head = head;
    body.add(head);
    objects.push(head);

    // ── Eyes (目) ──（head の子として追加）
    const { mesh: leftEye, geometry: leftEyeGeom } = this.createEye(
      materials.eye,
      -0.3
    );
    leftEye.position.set(-0.3, 0.2, 0.6);
    geometries.push(leftEyeGeom);
    parts.leftEye = leftEye;
    head.add(leftEye);
    objects.push(leftEye);

    const { mesh: rightEye, geometry: rightEyeGeom } = this.createEye(
      materials.eye,
      0.3
    );
    rightEye.position.set(0.3, 0.2, 0.6);
    geometries.push(rightEyeGeom);
    parts.rightEye = rightEye;
    head.add(rightEye);
    objects.push(rightEye);

    // ── Arms (腕) ──
    // armGroup 内に肩、上腕、肘、下腕の各パーツを階層的に配置
    const createArm = (side) => {
      const xOffset = side === "left" ? -1 : 1;
      const armGroup = new THREE.Group();
      armGroup.name = side + "ArmGroup";

      // 肩（joint）
      const { mesh: shoulder, geometry: shoulderGeom } = this.createShoulder(
        materials.joint,
        xOffset
      );
      geometries.push(shoulderGeom);
      parts[side + "Shoulder"] = shoulder;
      armGroup.add(shoulder);

      // 上腕
      const { mesh: upperArm, geometry: upperArmGeom } = this.createUpperArm(
        materials.limb,
        xOffset
      );
      // 肩からの相対位置
      upperArm.position.set(0, -0.6, 0);
      geometries.push(upperArmGeom);
      parts[side + "UpperArm"] = upperArm;
      shoulder.add(upperArm);

      // 肘（joint）
      const { mesh: elbow, geometry: elbowGeom } = this.createElbow(
        materials.joint,
        xOffset
      );
      elbow.position.set(0, -0.9, 0);
      geometries.push(elbowGeom);
      parts[side + "Elbow"] = elbow;
      upperArm.add(elbow);

      // 下腕
      const { mesh: lowerArm, geometry: lowerArmGeom } = this.createLowerArm(
        materials.limb,
        xOffset
      );
      lowerArm.position.set(0, -0.8, 0);
      geometries.push(lowerArmGeom);
      parts[side + "LowerArm"] = lowerArm;
      elbow.add(lowerArm);

      return armGroup;
    };

    const leftArmGroup = createArm("left");
    leftArmGroup.position.set(-0.95, 1.9, 0); // body からのオフセット
    parts.leftArmGroup = leftArmGroup;
    body.add(leftArmGroup);
    objects.push(leftArmGroup);

    const rightArmGroup = createArm("right");
    rightArmGroup.position.set(0.95, 1.9, 0);
    parts.rightArmGroup = rightArmGroup;
    body.add(rightArmGroup);
    objects.push(rightArmGroup);

    // ── Legs (脚) ──
    // legGroup 内に股関節、上腿、膝、下腿、足を階層的に配置
    const createLeg = (side) => {
      const xOffset = side === "left" ? -0.5 : 0.5;
      const legGroup = new THREE.Group();
      legGroup.name = side + "LegGroup";

      // 股関節（joint）
      const { mesh: hip, geometry: hipGeom } = this.createHip(
        materials.joint,
        xOffset
      );
      geometries.push(hipGeom);
      parts[side + "Hip"] = hip;
      legGroup.add(hip);

      // 上腿
      const { mesh: upperLeg, geometry: upperLegGeom } = this.createUpperLeg(
        materials.limb,
        xOffset
      );
      upperLeg.position.set(0, -0.8, 0);
      geometries.push(upperLegGeom);
      parts[side + "UpperLeg"] = upperLeg;
      hip.add(upperLeg);

      // 膝（joint）
      const { mesh: knee, geometry: kneeGeom } = this.createKnee(
        materials.joint,
        xOffset
      );
      knee.position.set(0, -1.0, 0);
      geometries.push(kneeGeom);
      parts[side + "Knee"] = knee;
      upperLeg.add(knee);

      // 下腿
      const { mesh: lowerLeg, geometry: lowerLegGeom } = this.createLowerLeg(
        materials.limb,
        xOffset
      );
      lowerLeg.position.set(0, -0.9, 0);
      geometries.push(lowerLegGeom);
      parts[side + "LowerLeg"] = lowerLeg;
      knee.add(lowerLeg);

      // 足（joint）
      const { mesh: foot, geometry: footGeom } = this.createFoot(
        materials.joint,
        xOffset
      );
      foot.position.set(0, -0.45, 0.2);
      geometries.push(footGeom);
      parts[side + "Foot"] = foot;
      lowerLeg.add(foot);

      return legGroup;
    };

    const leftLegGroup = createLeg("left");
    leftLegGroup.position.set(-0.5, 0, 0);
    parts.leftLegGroup = leftLegGroup;
    body.add(leftLegGroup);
    objects.push(leftLegGroup);

    const rightLegGroup = createLeg("right");
    rightLegGroup.position.set(0.5, 0, 0);
    parts.rightLegGroup = rightLegGroup;
    body.add(rightLegGroup);
    objects.push(rightLegGroup);

    // ── ライトの追加 ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const lights = [ambientLight, directionalLight];

    return { objects, parts, geometries, lights, robotGroup };
  }

  /**
   * アニメーション更新。
   * 階層構造により、親の動きが子に自動伝播するため、各パーツのローカルな回転を調整する。
   */
  static updateObjects(time, params = {}) {
    const { parts } = params;
    if (!parts || !parts.body) return;
    const a = this.animationParams;

    // 胴体の回転（全体の基準となる動き）
    parts.body.rotation.y =
      Math.sin(time * a.bodyRotationSpeed) * a.bodyRotationAmplitude;

    // 頭部：回転と僅かな上下移動（body の子として相対的に動作）
    parts.head.rotation.y =
      Math.sin(time * a.headRotationSpeed) * a.headRotationAmplitude;
    parts.head.position.y =
      1.6 + Math.sin(time * a.headBobSpeed) * a.headBobAmplitude;

    // 腕の動き
    const armSwing = Math.sin(time * a.armSwingSpeed);
    // 左腕
    if (parts.leftShoulder) {
      parts.leftShoulder.rotation.x = armSwing * a.armSwingAmplitudeUpper;
    }
    if (parts.leftUpperArm) {
      parts.leftUpperArm.rotation.x = armSwing * a.armSwingAmplitudeUpper;
    }
    if (parts.leftElbow) {
      parts.leftElbow.rotation.x =
        Math.sin(time * a.armSwingSpeed + 0.5) * a.armSwingAmplitudeLower;
    }
    if (parts.leftLowerArm) {
      parts.leftLowerArm.rotation.x =
        Math.sin(time * a.armSwingSpeed + 0.5) * a.armSwingAmplitudeLower;
    }
    // 右腕：位相を π ずらす
    const armSwingRight = Math.sin(time * a.armSwingSpeed + Math.PI);
    if (parts.rightShoulder) {
      parts.rightShoulder.rotation.x = armSwingRight * a.armSwingAmplitudeUpper;
    }
    if (parts.rightUpperArm) {
      parts.rightUpperArm.rotation.x = armSwingRight * a.armSwingAmplitudeUpper;
    }
    if (parts.rightElbow) {
      parts.rightElbow.rotation.x =
        Math.sin(time * a.armSwingSpeed + Math.PI + 0.5) *
        a.armSwingAmplitudeLower;
    }
    if (parts.rightLowerArm) {
      parts.rightLowerArm.rotation.x =
        Math.sin(time * a.armSwingSpeed + Math.PI + 0.5) *
        a.armSwingAmplitudeLower;
    }

    // 脚の動き
    const legSwing = Math.sin(time * a.legSwingSpeed);
    // 左脚
    if (parts.leftHip) {
      parts.leftHip.rotation.x = legSwing * a.legSwingAmplitudeUpper;
    }
    if (parts.leftUpperLeg) {
      parts.leftUpperLeg.rotation.x = legSwing * a.legSwingAmplitudeUpper;
    }
    if (parts.leftKnee) {
      parts.leftKnee.rotation.x =
        Math.abs(Math.sin(time * a.legSwingSpeed + 0.5)) *
        a.legSwingAmplitudeLower;
    }
    if (parts.leftLowerLeg) {
      parts.leftLowerLeg.rotation.x =
        Math.abs(Math.sin(time * a.legSwingSpeed + 0.5)) *
        a.legSwingAmplitudeLower;
    }
    // 右脚
    const legSwingRight = Math.sin(time * a.legSwingSpeed + Math.PI);
    if (parts.rightHip) {
      parts.rightHip.rotation.x = legSwingRight * a.legSwingAmplitudeUpper;
    }
    if (parts.rightUpperLeg) {
      parts.rightUpperLeg.rotation.x = legSwingRight * a.legSwingAmplitudeUpper;
    }
    if (parts.rightKnee) {
      parts.rightKnee.rotation.x =
        Math.abs(Math.sin(time * a.legSwingSpeed + Math.PI + 0.5)) *
        a.legSwingAmplitudeLower;
    }
    if (parts.rightLowerLeg) {
      parts.rightLowerLeg.rotation.x =
        Math.abs(Math.sin(time * a.legSwingSpeed + Math.PI + 0.5)) *
        a.legSwingAmplitudeLower;
    }
  }

  /**
   * 初期化：シーンにロボットとライトを追加し、カメラ位置を設定する。
   */
  async init() {
    try {
      const { parts, lights, robotGroup } = GeometryShowcase026.setupScene(
        this.scene
      );
      this.robotParts = parts;
      // robotGroup を this.objects に直接追加
      this.objects.add(robotGroup);

      // カメラの初期位置設定（scene.userData.camera が設定されている前提）
      if (this.scene.userData.camera) {
        this.scene.userData.camera.position.set(0, 0, 10);
        this.scene.userData.camera.lookAt(0, 0, 0);
      }
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  /**
   * フレーム毎の更新処理（アニメーション更新）
   */
  update(deltaTime) {
    this.time += deltaTime;
    // 初期化完了前は更新処理を行わない
    if (!this.robotParts || !this.robotParts.body) return;
    GeometryShowcase026.updateObjects(this.time, { parts: this.robotParts });
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 0, 10],
      target: [0, 0, 0],
    };
  }

  /**
   * プレビュー用のレンダリングセットアップ。
   * コンテナサイズに合わせたレンダラーとシーン、カメラを用意する。
   */
  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const { objects, parts, geometries } = this.setupScene(scene);
    let time = 0;

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(time, { parts });
        renderer.render(scene, camera);
      },
      dispose: () => {
        // 使用したジオメトリの破棄
        geometries.forEach((g) => g.dispose());
        // 各オブジェクトのマテリアルを破棄（配列の場合も考慮）
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

  /**
   * ロボットのサムネイル用SVGをBlobに変換して返す。
   */
  static getThumbnailBlob() {
    // シンプルなSVGでロボットを表現
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Robot body -->
        <rect x="75" y="60" width="50" height="70" fill="#5555ff" stroke="#444444" stroke-width="1"/>
        
        <!-- Head -->
        <rect x="80" y="30" width="40" height="40" fill="#7777ff" stroke="#444444" stroke-width="1"/>
        
        <!-- Eyes -->
        <rect x="90" y="40" width="10" height="10" fill="#ff0000"/>
        <rect x="110" y="40" width="10" height="10" fill="#ff0000"/>
        
        <!-- Arms -->
        <rect x="55" y="70" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
        <rect x="125" y="70" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
        
        <!-- Legs -->
        <rect x="75" y="130" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
        <rect x="105" y="130" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
        
        <!-- Joints -->
        <rect x="55" y="70" width="20" height="10" fill="#222222"/>
        <rect x="125" y="70" width="20" height="10" fill="#222222"/>
        <rect x="75" y="130" width="20" height="10" fill="#222222"/>
        <rect x="105" y="130" width="20" height="10" fill="#222222"/>
        
        <!-- Feet -->
        <rect x="70" y="190" width="30" height="10" fill="#222222"/>
        <rect x="100" y="190" width="30" height="10" fill="#222222"/>
      </svg>
    `;

    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);
    return fetch(dataURL).then((res) => res.blob());
  }
}
