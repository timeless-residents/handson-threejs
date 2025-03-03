import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase025 extends UseCaseBase {
  static metadata = {
    id: "025",
    title: "Wipe Transition Sequencer",
    description:
      "A wipe transition effect between multiple images using a sequencer",
    categories: ["Shader", "Transition", "Image"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.currentImageIndex = 0;
    this.nextImageIndex = 1;
    this.transitionProgress = 0;
    this.isTransitioning = false;
    this.transitionDuration = 1.0; // seconds
    this.imageDuration = 3.0; // seconds to display each image before transition
    this.lastTransitionTime = 0;
  }

  static setupScene(scene) {
    // Create a plane to display the images
    const geometry = new THREE.PlaneGeometry(16, 9);

    // Create shader material for the wipe transition
    const material = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
        progress: { value: 0.0 },
        direction: { value: new THREE.Vector2(1.0, 0.0) }, // Direction of the wipe (horizontal)
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D textureA;
        uniform sampler2D textureB;
        uniform float progress;
        uniform vec2 direction;
        
        varying vec2 vUv;
        
        void main() {
          // Calculate the wipe effect
          float prog = dot(vUv - 0.5, normalize(direction)) + 0.5;
          vec4 colorA = texture2D(textureA, vUv);
          vec4 colorB = texture2D(textureB, vUv);
          
          // Apply the wipe transition
          gl_FragColor = mix(colorA, colorB, step(prog, progress));
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add lights
    const lights = UseCaseBase.setupDefaultLighting(scene);

    return {
      objects: [mesh, ...lights],
      geometries: [geometry],
      material: material,
      mesh: mesh, // Add mesh to the return object for easy access
    };
  }

  async loadImages() {
    const imageUrls = [
      "https://picsum.photos/id/10/1600/900", // Nature
      "https://picsum.photos/id/20/1600/900", // Architecture
      "https://picsum.photos/id/30/1600/900", // People
      "https://picsum.photos/id/40/1600/900", // Objects
      "https://picsum.photos/id/50/1600/900", // Animals
    ];

    const textureLoader = new THREE.TextureLoader();

    // Load all textures
    this.textures = await Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          textureLoader.load(
            url,
            (texture) => {
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              resolve(texture);
            },
            undefined,
            reject
          );
        });
      })
    );

    // 修正：this.material を直接利用してテクスチャを設定する
    this.material.uniforms.textureA.value = this.textures[0];
    this.material.uniforms.textureB.value = this.textures[1];
  }

  async init() {
    const { objects, material, mesh } = GeometryShowcase025.setupScene(
      this.scene
    );
    objects.forEach((obj) => this.objects.add(obj));

    this.material = material;
    this.mesh = mesh; // Store mesh reference for animation
    await this.loadImages();

    // Position the camera to see the plane
    if (this.scene.userData.camera) {
      this.scene.userData.camera.position.set(0, 0, 15);
      this.scene.userData.camera.lookAt(0, 0, 0);
    }
  }

  // Static method to update objects - can be used by both update() and createPreview()
  static updateObjects(objects, time, mousePos = { x: 0, y: 0 }, params = {}) {
    const {
      material,
      mesh,
      textures,
      currentImageIndex = 0,
      nextImageIndex = 1,
      isTransitioning = false,
      transitionProgress = 0,
      lastTransitionTime = 0,
      transitionDuration = 1.0,
      imageDuration = 3.0,
    } = params;

    // Add gentle floating movement to the plane
    if (mesh) {
      // Gentle rotation
      mesh.rotation.x = Math.sin(time * 0.2) * 0.05;
      mesh.rotation.y = Math.sin(time * 0.3) * 0.05;

      // Subtle floating motion
      mesh.position.y = Math.sin(time * 0.5) * 0.2;
    }

    // If we don't have textures or material, we can't do transitions
    if (!textures || !material || textures.length < 2) {
      return {
        currentImageIndex,
        nextImageIndex,
        isTransitioning,
        transitionProgress,
        lastTransitionTime,
      };
    }

    let newIsTransitioning = isTransitioning;
    let newTransitionProgress = transitionProgress;
    let newLastTransitionTime = lastTransitionTime;
    let newCurrentImageIndex = currentImageIndex;
    let newNextImageIndex = nextImageIndex;

    // Check if we need to start a new transition
    if (!isTransitioning && time - lastTransitionTime > imageDuration) {
      newIsTransitioning = true;
      newTransitionProgress = 0;

      // Update indices for next transition
      newCurrentImageIndex = nextImageIndex;
      newNextImageIndex = (nextImageIndex + 1) % textures.length;

      // Update textures
      material.uniforms.textureA.value = textures[newCurrentImageIndex];
      material.uniforms.textureB.value = textures[newNextImageIndex];

      // Randomize wipe direction
      const angle = Math.random() * Math.PI * 2;
      material.uniforms.direction.value.set(Math.cos(angle), Math.sin(angle));
    }

    // Update transition progress
    if (isTransitioning) {
      newTransitionProgress += 0.016 / transitionDuration; // Use fixed deltaTime for consistency

      if (newTransitionProgress >= 1.0) {
        newTransitionProgress = 0;
        newIsTransitioning = false;
        newLastTransitionTime = time;

        // Swap current texture to be the completed transition
        newCurrentImageIndex = nextImageIndex;
        material.uniforms.textureA.value = textures[newCurrentImageIndex];
      }

      // Update shader uniform
      material.uniforms.progress.value = newTransitionProgress;
    }

    return {
      currentImageIndex: newCurrentImageIndex,
      nextImageIndex: newNextImageIndex,
      isTransitioning: newIsTransitioning,
      transitionProgress: newTransitionProgress,
      lastTransitionTime: newLastTransitionTime,
    };
  }

  update(deltaTime) {
    this.time += deltaTime;

    // Use the static updateObjects method
    const result = GeometryShowcase025.updateObjects(
      Array.from(this.objects),
      this.time,
      { x: 0, y: 0 },
      {
        material: this.material,
        mesh: this.mesh,
        textures: this.textures,
        currentImageIndex: this.currentImageIndex,
        nextImageIndex: this.nextImageIndex,
        isTransitioning: this.isTransitioning,
        transitionProgress: this.transitionProgress,
        lastTransitionTime: this.lastTransitionTime,
        transitionDuration: this.transitionDuration,
        imageDuration: this.imageDuration,
      }
    );

    // Update instance variables with the result
    this.currentImageIndex = result.currentImageIndex;
    this.nextImageIndex = result.nextImageIndex;
    this.isTransitioning = result.isTransitioning;
    this.transitionProgress = result.transitionProgress;
    this.lastTransitionTime = result.lastTransitionTime;
  }

  dispose() {
    super.dispose();

    // Dispose textures
    if (this.textures) {
      this.textures.forEach((texture) => texture.dispose());
    }
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 0, 15],
      target: [0, 0, 0],
    };
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const { objects, geometries, material, mesh } = this.setupScene(scene);

    // プレースホルダー用テクスチャの読み込み
    const textureLoader = new THREE.TextureLoader();
    const textures = [];

    // Load multiple images for the preview
    const imageUrls = [
      "https://picsum.photos/id/10/800/450", // Nature
      "https://picsum.photos/id/20/800/450", // Architecture
      "https://picsum.photos/id/30/800/450", // People
      "https://picsum.photos/id/40/800/450", // Objects
      "https://picsum.photos/id/50/800/450", // Animals
    ];

    // Load all textures
    imageUrls.forEach((url) => {
      const texture = textureLoader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
      });
      textures.push(texture);
    });

    // Set initial textures
    if (textures.length >= 2) {
      material.uniforms.textureA.value = textures[0];
      material.uniforms.textureB.value = textures[1];
    }

    let time = 0;
    let currentImageIndex = 0;
    let nextImageIndex = 1;
    let isTransitioning = false;
    let transitionProgress = 0;
    let lastTransitionTime = 0;
    const transitionDuration = 1.0;
    const imageDuration = 3.0;

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;

        // Use the static updateObjects method
        const result = this.updateObjects(
          objects,
          time,
          { x: 0, y: 0 },
          {
            material,
            mesh,
            textures,
            currentImageIndex,
            nextImageIndex,
            isTransitioning,
            transitionProgress,
            lastTransitionTime,
            transitionDuration,
            imageDuration,
          }
        );

        // Update local variables with the result
        currentImageIndex = result.currentImageIndex;
        nextImageIndex = result.nextImageIndex;
        isTransitioning = result.isTransitioning;
        transitionProgress = result.transitionProgress;
        lastTransitionTime = result.lastTransitionTime;

        renderer.render(scene, camera);
      },
      dispose: () => {
        geometries.forEach((g) => g.dispose());
        material.dispose();
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
      },
    };
  }

  static async generateThumbnail(width = 200, height = 200) {
    // オフスクリーンレンダラーの作成
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);

    // カメラの設定
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    // シーンの設定
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // デフォルトライティングを追加
    const lights = UseCaseBase.setupDefaultLighting(scene);

    // シーンオブジェクトのセットアップ（setupScene を使用）
    const { objects, geometries, material, mesh } = this.setupScene(scene);

    // Add some animation to the mesh for the thumbnail
    if (mesh) {
      mesh.rotation.x = 0.05;
      mesh.rotation.y = 0.05;
      mesh.position.y = 0.1;
    }

    // テクスチャを非同期で読み込む
    const placeholderA = await loadTextureAsync(
      "https://picsum.photos/id/10/800/450"
    );
    const placeholderB = await loadTextureAsync(
      "https://picsum.photos/id/20/800/450"
    );

    // マテリアルの uniform に設定
    material.uniforms.textureA.value = placeholderA;
    material.uniforms.textureB.value = placeholderB;
    material.uniforms.progress.value = 0.5; // 固定値でOK
    material.needsUpdate = true;

    // シーンをレンダリング
    renderer.render(scene, camera);
    const thumbnailURL = renderer.domElement.toDataURL("image/png");

    // 後片付け（不要なリソースを解放）
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
    lights.forEach((light) => {
      scene.remove(light);
      if (light.dispose) light.dispose();
    });
    renderer.dispose();

    return thumbnailURL;
  }

  static getThumbnailBlob() {
    console.log("WipeTransitionSequencer.getThumbnailBlob が呼ばれました");
    // SVGデータ - ワイプトランジションを表現
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- 背景のグラデーション -->
        <defs>
          <linearGradient id="gradientA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3498db" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#9b59b6" stop-opacity="0.6"/>
          </linearGradient>
          <linearGradient id="gradientB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2ecc71" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#f1c40f" stop-opacity="0.6"/>
          </linearGradient>
        </defs>
        
        <!-- 平面の表現 -->
        <g transform="translate(100, 100) rotate(3) translate(-100, -100)">
          <!-- 左側の画像（グラデーションA） -->
          <path d="M20,20 L100,20 L100,180 L20,180 Z" fill="url(#gradientA)"/>
          
          <!-- 右側の画像（グラデーションB） -->
          <path d="M100,20 L180,20 L180,180 L100,180 Z" fill="url(#gradientB)"/>
          
          <!-- ワイプトランジションの境界線 -->
          <line x1="100" y1="20" x2="100" y2="180" stroke="white" stroke-width="2" stroke-opacity="0.7"/>
          
          <!-- 境界線上の矢印（トランジション方向を示す） -->
          <polygon points="100,90 110,100 100,110" fill="white" fill-opacity="0.9"/>
          <polygon points="100,110 90,100 100,90" fill="white" fill-opacity="0.9"/>
        </g>
        
        <!-- タイトルテキスト -->
        <text x="100" y="20" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Wipe Transition Sequencer</text>
      </svg>
    `;

    // Unicode対応のためのエンコード
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // Promiseを確実に返す
    return fetch(dataURL).then((res) => res.blob());
  }
}

function loadTextureAsync(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}
