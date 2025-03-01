import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase023 extends UseCaseBase {
  static metadata = {
    id: "023",
    title: "Glass Silhouette Effect",
    description:
      "透明シェーダ＋背面を黒くするノードで、ガラス越しに見る黒シルエット効果",
    categories: ["Shader", "Material", "Glass", "Silhouette"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
    this.rotationSpeed = 0.2;
    this.glassSphere = null;
    this.innerObjects = [];
  }

  static setupScene(scene) {
    // シーンの背景色を設定（明るい色）
    scene.background = new THREE.Color(0xf5f5f5);
    
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
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    objects.push(mainLight);

    // サブライト（反対側からの光）
    const subLight = new THREE.DirectionalLight(0xffffff, 0.4);
    subLight.position.set(-5, 3, -5);
    scene.add(subLight);
    objects.push(subLight);

    // ガラス球の作成
    const glassGeometry = new THREE.SphereGeometry(2, 64, 64);
    geometries.push(glassGeometry);

    // ガラスマテリアル
    const glassMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        refractionRatio: { value: 0.98 },
        fresnelBias: { value: 0.1 },
        fresnelScale: { value: 1.0 },
        fresnelPower: { value: 2.0 },
        opacity: { value: 0.6 },
        envMap: { value: null }
      },
      vertexShader: `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float refractionRatio;
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        uniform float opacity;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDirection = normalize(vViewPosition);
          
          // フレネル効果の計算
          float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDirection, normal), fresnelPower);
          
          // 基本的なガラスの色（薄い青）
          vec3 glassColor = vec3(0.8, 0.9, 1.0);
          
          // フレネル効果を適用
          vec3 finalColor = mix(glassColor, vec3(1.0), fresnel);
          
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false
    });

    const glassSphere = new THREE.Mesh(glassGeometry, glassMaterial);
    glassSphere.castShadow = true;
    glassSphere.receiveShadow = true;
    scene.add(glassSphere);
    objects.push(glassSphere);

    // 内部オブジェクト用のグループ
    const innerGroup = new THREE.Group();
    scene.add(innerGroup);
    objects.push(innerGroup);

    // 内部オブジェクトの作成（シルエットとして見えるオブジェクト）
    const innerObjects = [];
    
    // 様々な形状のオブジェクトを作成
    const shapes = [
      new THREE.TorusKnotGeometry(0.5, 0.2, 64, 16),
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.ConeGeometry(0.5, 1, 16),
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.TetrahedronGeometry(0.5)
    ];
    geometries.push(...shapes);

    // シルエットマテリアル（背面を黒く、前面を通常の色で表示）
    const silhouetteMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x444444) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDirection = normalize(vViewPosition);
          
          // 視線と法線の内積で前面/背面を判定
          float facing = dot(normal, viewDirection);
          
          // 背面（内側から見たとき）は黒、前面は指定色
          vec3 finalColor = facing > 0.0 ? color : vec3(0.0);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    // 内部オブジェクトを配置
    for (let i = 0; i < 5; i++) {
      const geometry = shapes[i];
      const material = silhouetteMaterial.clone();
      material.uniforms.color.value = new THREE.Color(
        Math.random() * 0.5 + 0.3,
        Math.random() * 0.5 + 0.3,
        Math.random() * 0.5 + 0.3
      );
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // オブジェクトをランダムに配置
      const radius = Math.random() * 0.8 + 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      mesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
      
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      innerGroup.add(mesh);
      innerObjects.push(mesh);
    }

    // 床を追加
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);
    objects.push(floor);
    geometries.push(floorGeometry);

    return {
      objects,
      geometries,
      glassSphere,
      innerObjects,
      innerGroup
    };
  }

  static updateObjects(objects, time = 0, mousePos = { x: 0, y: 0 }, params = {}) {
    const { glassSphere, innerObjects, innerGroup } = params;

    if (!glassSphere || !innerObjects || !innerGroup) return;

    // ガラス球の回転
    glassSphere.rotation.y = time * 0.1;
    glassSphere.rotation.x = Math.sin(time * 0.2) * 0.2;

    // ガラスのシェーダーパラメータを更新
    if (glassSphere.material.uniforms) {
      glassSphere.material.uniforms.time.value = time;
      // 時間によって屈折率を微妙に変化させる
      glassSphere.material.uniforms.refractionRatio.value = 0.98 + Math.sin(time * 0.5) * 0.01;
    }

    // 内部オブジェクトの回転
    innerGroup.rotation.y = time * 0.2;
    innerGroup.rotation.x = Math.sin(time * 0.3) * 0.3;

    // 個々の内部オブジェクトのアニメーション
    innerObjects.forEach((obj, i) => {
      // 個別に回転
      obj.rotation.x += Math.sin(time * 0.2 + i) * 0.01;
      obj.rotation.y += Math.cos(time * 0.3 + i) * 0.01;
      
      // 位置を微妙に変化させる
      const radius = 0.8 + Math.sin(time * 0.5 + i * 0.7) * 0.2;
      const theta = obj.userData.initialTheta + time * (0.1 + i * 0.05);
      const phi = obj.userData.initialPhi + Math.sin(time * 0.3 + i) * 0.2;
      
      obj.position.x = radius * Math.sin(phi) * Math.cos(theta);
      obj.position.y = radius * Math.cos(phi);
      obj.position.z = radius * Math.sin(phi) * Math.sin(theta);
    });
  }

  async init() {
    const { objects, glassSphere, innerObjects, innerGroup } = GeometryShowcase023.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    
    this.glassSphere = glassSphere;
    this.innerObjects = innerObjects;
    this.innerGroup = innerGroup;
    
    // 内部オブジェクトの初期角度を保存
    this.innerObjects.forEach((obj, i) => {
      obj.userData.initialTheta = Math.random() * Math.PI * 2;
      obj.userData.initialPhi = Math.random() * Math.PI;
    });
  }

  update(deltaTime) {
    this.time += deltaTime * this.rotationSpeed;
    
    GeometryShowcase023.updateObjects(
      Array.from(this.objects),
      this.time,
      { x: 0, y: 0 },
      {
        glassSphere: this.glassSphere,
        innerObjects: this.innerObjects,
        innerGroup: this.innerGroup
      }
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [4, 3, 4],
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
    camera.position.set(4, 3, 4);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    const { objects, geometries, glassSphere, innerObjects, innerGroup } = this.setupScene(scene);
    let time = 0;

    const animate = () => {
      time += 0.016;
      this.updateObjects(
        objects,
        time,
        { x: 0, y: 0 },
        { glassSphere, innerObjects, innerGroup }
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
          time,
          { x: 0, y: 0 },
          { glassSphere, innerObjects, innerGroup }
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
    // SVGデータ - ガラス球とシルエットを表現
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f5f5f5"/>
        
        <!-- 背景の円形グラデーション -->
        <defs>
          <radialGradient id="glassGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
            <stop offset="70%" stop-color="#e0f0ff" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#c0e0ff" stop-opacity="0.6"/>
          </radialGradient>
          
          <!-- シルエット用のフィルター -->
          <filter id="silhouetteFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
            <feComponentTransfer in="blur" result="shadow">
              <feFuncR type="linear" slope="0" intercept="0"/>
              <feFuncG type="linear" slope="0" intercept="0"/>
              <feFuncB type="linear" slope="0" intercept="0"/>
              <feFuncA type="linear" slope="1" intercept="0"/>
            </feComponentTransfer>
          </filter>
        </defs>
        
        <!-- 床 -->
        <rect x="20" y="150" width="160" height="30" fill="#eeeeee" rx="2"/>
        
        <!-- ガラス球の中のシルエット -->
        <g filter="url(#silhouetteFilter)" transform="translate(100, 100)">
          <!-- トーラスノット風のシルエット -->
          <path d="M-20,0 C-20,15 0,20 15,10 C30,0 20,-20 0,-15 C-15,-10 -20,0 -20,0 Z" fill="black"/>
          
          <!-- 立方体風のシルエット -->
          <rect x="-10" y="-10" width="20" height="20" fill="black" transform="rotate(30)"/>
          
          <!-- 円錐風のシルエット -->
          <polygon points="0,-20 15,10 -15,10" fill="black" transform="rotate(-20)"/>
        </g>
        
        <!-- ガラス球 -->
        <circle cx="100" cy="100" r="60" fill="url(#glassGradient)" opacity="0.8"/>
        
        <!-- ガラスの光沢 -->
        <ellipse cx="80" cy="80" rx="20" ry="15" fill="white" opacity="0.5" transform="rotate(-20, 80, 80)"/>
        <ellipse cx="120" cy="70" rx="10" ry="5" fill="white" opacity="0.3"/>
        
        <!-- ガラスの輪郭 -->
        <circle cx="100" cy="100" r="60" fill="none" stroke="#a0c0e0" stroke-width="1" opacity="0.7"/>
      </svg>
    `;

    // Unicode対応のためのエンコード
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);
    
    // Promiseを確実に返す
    return fetch(dataURL).then(res => res.blob());
  }
}
