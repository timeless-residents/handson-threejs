import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase019 extends UseCaseBase {
  static metadata = {
    id: "019",
    title: "Cosmic Nebula Effect",
    description:
      "Interactive particle-based nebula with cosmic dust and light rays",
    categories: ["Particles", "Animation", "Lighting", "Space"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.particles = null;
    this.starField = null;
    this.rayLight = null;
    this.mouse = { x: 0, y: 0 };
  }

  static setupScene(scene) {
    // 背景を暗い青に設定
    scene.background = new THREE.Color(0x000510);

    const objects = [];
    const geometries = [];

    // 環境光を追加（非常に弱め）
    const ambientLight = new THREE.AmbientLight(0x111122, 0.2);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // 星雲の粒子を作成
    const particleCount = 5000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // 星雲の色のグラデーションを定義
    const colorPalette = [
      new THREE.Color(0x4455dd), // 青
      new THREE.Color(0x9955ff), // 紫
      new THREE.Color(0xff5566), // ピンク
      new THREE.Color(0x22aadd), // 水色
    ];

    // 粒子の形状は球体の中にランダムに配置
    const radius = 5;
    for (let i = 0; i < particleCount; i++) {
      // 極座標を使って球体内にランダムに配置
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // 中心に近いほど密度が高くなるように
      const r = Math.pow(Math.random(), 1.5) * radius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 距離に基づいて色を選択
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      const normalizedDistance = distanceFromCenter / radius;
      
      // 色をブレンド
      const colorIndex = Math.min(
        Math.floor(normalizedDistance * colorPalette.length),
        colorPalette.length - 1
      );
      const nextColorIndex = (colorIndex + 1) % colorPalette.length;
      const blendFactor = normalizedDistance * colorPalette.length - colorIndex;
      
      const color = new THREE.Color().copy(colorPalette[colorIndex]);
      color.lerp(colorPalette[nextColorIndex], blendFactor);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // 粒子のサイズもランダム
      sizes[i] = 0.1 + Math.random() * 0.3;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // シェーダーマテリアルを作成
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    objects.push(particles);
    geometries.push(particleGeometry);

    // 星空の背景を作成
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // 星を球体の外側にランダムに配置
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * 2 + Math.random() * radius * 3;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // 星のサイズ
      starSizes[i] = 0.01 + Math.random() * 0.03;

      // 星の色（白～青～黄色）
      const starColor = new THREE.Color();
      const hue = Math.random() > 0.8 ? 0.15 : Math.random() > 0.7 ? 0.6 : 0;
      const saturation = Math.random() * 0.3;
      const lightness = 0.8 + Math.random() * 0.2;
      starColor.setHSL(hue, saturation, lightness);

      starColors[i * 3] = starColor.r;
      starColors[i * 3 + 1] = starColor.g;
      starColors[i * 3 + 2] = starColor.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    objects.push(starField);
    geometries.push(starGeometry);

    // ライトレイ効果を追加
    const rayGeometry = new THREE.CylinderGeometry(0, 0.5, 5, 16, 1, true);
    const rayMaterial = new THREE.MeshBasicMaterial({
      color: 0x3366ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rayLight = new THREE.Mesh(rayGeometry, rayMaterial);
    rayLight.position.set(0, 0, 0);
    rayLight.rotation.set(Math.PI / 2, 0, 0);
    rayLight.scale.set(1, 1, 1);
    scene.add(rayLight);
    objects.push(rayLight);
    geometries.push(rayGeometry);

    return { 
      objects, 
      geometries, 
      particles, 
      starField, 
      rayLight 
    };
  }

  static updateObjects(objects, particles, starField, rayLight, time, mouse = { x: 0, y: 0 }) {
    if (!particles || !starField || !rayLight) return;

    // 星雲の動き
    particles.rotation.y = time * 0.05;
    particles.rotation.z = time * 0.03;

    // 明滅効果
    const pulseIntensity = 0.7 + 0.3 * Math.sin(time * 0.5);
    particles.material.opacity = 0.7 * pulseIntensity;

    // 星の点滅
    starField.rotation.y = time * 0.02;
    
    // マウス位置に基づいてライトレイを動かす
    if (rayLight) {
      rayLight.rotation.x = Math.PI / 2 + mouse.y * 0.5;
      rayLight.rotation.z = mouse.x * 0.5;
      rayLight.material.opacity = 0.2 + 0.1 * Math.sin(time * 2);
    }
  }

  async init() {
    const { objects, particles, starField, rayLight } = GeometryShowcase019.setupScene(
      this.scene
    );
    objects.forEach((obj) => this.objects.add(obj));
    this.particles = particles;
    this.starField = starField;
    this.rayLight = rayLight;
    
    // マウスイベントを追加
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  handleMouseMove(event) {
    // 正規化されたマウス座標を計算 (-1 から 1 の範囲)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase019.updateObjects(
      Array.from(this.objects),
      this.particles,
      this.starField,
      this.rayLight,
      this.time,
      this.mouse
    );
  }

  dispose() {
    super.dispose();
    // イベントリスナーを削除
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 0, 10],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // サムネイル画像をBase64エンコードされた文字列として返す
    // これは宇宙の星雲を表現したSVG画像
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#000510"/>
        
        <!-- 小さな星 -->
        <g fill="#FFFFFF" opacity="0.8">
          <circle cx="20" cy="30" r="1" />
          <circle cx="40" cy="50" r="1.2" />
          <circle cx="60" cy="20" r="0.8" />
          <circle cx="80" cy="40" r="1" />
          <circle cx="100" cy="10" r="1.1" />
          <circle cx="120" cy="30" r="0.9" />
          <circle cx="140" cy="50" r="1" />
          <circle cx="160" cy="20" r="1.2" />
          <circle cx="180" cy="40" r="0.8" />
          <circle cx="30" cy="60" r="1" />
          <circle cx="50" cy="80" r="1.2" />
          <circle cx="70" cy="70" r="0.8" />
          <circle cx="90" cy="90" r="1" />
          <circle cx="110" cy="60" r="1.1" />
          <circle cx="130" cy="80" r="0.9" />
          <circle cx="150" cy="70" r="1" />
          <circle cx="170" cy="90" r="1.2" />
          <circle cx="10" cy="100" r="0.8" />
          <circle cx="30" cy="120" r="1" />
          <circle cx="50" cy="110" r="1.2" />
          <circle cx="70" cy="130" r="0.8" />
          <circle cx="90" cy="150" r="1" />
          <circle cx="110" cy="170" r="1.1" />
          <circle cx="130" cy="140" r="0.9" />
          <circle cx="150" cy="160" r="1" />
          <circle cx="170" cy="180" r="1.2" />
          <circle cx="190" cy="150" r="0.8" />
        </g>
        
        <!-- 星雲の中心 -->
        <ellipse cx="100" cy="100" rx="50" ry="40" fill="url(#nebula-gradient)" opacity="0.7" />
        
        <!-- 青い光線 -->
        <path d="M80,100 L60,150 L140,150 L120,100 Z" fill="#3366FF" opacity="0.4" />
        
        <!-- 粒子のようなドット -->
        <g fill="#9955FF" opacity="0.8">
          <circle cx="85" cy="90" r="2" />
          <circle cx="95" cy="85" r="3" />
          <circle cx="105" cy="95" r="2.5" />
          <circle cx="115" cy="90" r="2" />
          <circle cx="90" cy="105" r="2.5" />
          <circle cx="100" cy="110" r="3" />
          <circle cx="110" cy="105" r="2" />
        </g>
        
        <g fill="#4455DD" opacity="0.7">
          <circle cx="75" cy="95" r="2" />
          <circle cx="80" cy="105" r="1.5" />
          <circle cx="95" cy="115" r="2" />
          <circle cx="120" cy="85" r="1.5" />
          <circle cx="125" cy="100" r="2" />
        </g>
        
        <g fill="#FF5566" opacity="0.6">
          <circle cx="85" cy="80" r="1.5" />
          <circle cx="100" cy="75" r="2" />
          <circle cx="115" cy="80" r="1.5" />
          <circle cx="80" cy="115" r="2" />
          <circle cx="120" cy="115" r="1.5" />
        </g>
        
        <!-- グラデーション定義 -->
        <defs>
          <radialGradient id="nebula-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#9955FF" stop-opacity="0.9"/>
            <stop offset="40%" stop-color="#4455DD" stop-opacity="0.7"/>
            <stop offset="70%" stop-color="#FF5566" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#22AADD" stop-opacity="0.3"/>
          </radialGradient>
        </defs>
      </svg>
    `;

    // Base64エンコードされたデータURLを作成
    const dataURL = "data:image/svg+xml;base64," + btoa(svgString);

    // Blobオブジェクトに変換して返す
    return fetch(dataURL).then((res) => res.blob());
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    const { objects, geometries, particles, starField, rayLight } = this.setupScene(scene);
    let time = 0;

    // プレビュー用のマウス制御
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      time += 0.016;
      this.updateObjects(objects, particles, starField, rayLight, time, mouse);
      renderer.render(scene, camera);
    };

    // 初期レンダリング
    animate();

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, particles, starField, rayLight, time, mouse);
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
        container.removeEventListener('mousemove', handleMouseMove);
        renderer.dispose();
      },
    };
  }
}