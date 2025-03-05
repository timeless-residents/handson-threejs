import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class MotionBlurMonkey027 extends UseCaseBase {
  static metadata = {
    id: "027",
    title: "Motion Blur Monkey",
    description:
      "A monkey model with motion blur effect to create a vibration illusion",
    categories: ["Effects", "Animation", "Model"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.monkeyGroup = null;
    this.monkeyInstances = [];
    this.blurAmount = 8; // Number of blur instances (increased)
    this.vibrationSpeed = 8; // Speed of vibration (reduced for slower movement)
    this.vibrationAmplitude = 0.15; // Amplitude of vibration (increased)

    // Create a group to hold all objects
    this.objects = new THREE.Group();
    scene.add(this.objects);
  }

  /**
   * Create a simple monkey head using Three.js geometries
   */
  static createMonkeyHead(material) {
    // Create a group to hold all parts of the monkey head
    const monkeyHead = new THREE.Group();
    monkeyHead.name = "monkeyHead";

    // Create the main head shape (slightly elongated sphere)
    const headGeometry = new THREE.SphereGeometry(1, 32, 24);
    // Scale the sphere to make it more oval-like
    headGeometry.scale(1, 1.2, 1);
    const head = new THREE.Mesh(headGeometry, material);
    monkeyHead.add(head);

    // Create the muzzle/snout
    const muzzleGeometry = new THREE.SphereGeometry(0.5, 32, 16);
    muzzleGeometry.scale(1, 0.8, 1.2);
    const muzzle = new THREE.Mesh(muzzleGeometry, material);
    muzzle.position.set(0, -0.3, 0.7);
    monkeyHead.add(muzzle);

    // Create the ears (flattened spheres)
    const earGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    earGeometry.scale(1, 1, 0.3);

    const leftEar = new THREE.Mesh(earGeometry, material);
    leftEar.position.set(-0.8, 0.5, 0);
    leftEar.rotation.y = -Math.PI / 4;
    monkeyHead.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, material);
    rightEar.position.set(0.8, 0.5, 0);
    rightEar.rotation.y = Math.PI / 4;
    monkeyHead.add(rightEar);

    // Create the eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.35, 0.1, 0.8);
    monkeyHead.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.35, 0.1, 0.8);
    monkeyHead.add(rightEye);

    // Create the nose
    const noseGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    noseGeometry.scale(1.2, 0.7, 1);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, -0.2, 1.1);
    monkeyHead.add(nose);

    // Create the mouth (curved line)
    const mouthGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 12, Math.PI);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.4, 1);
    mouth.rotation.x = Math.PI / 2;
    mouth.rotation.z = Math.PI;
    monkeyHead.add(mouth);

    // Collect all geometries for disposal later
    const geometries = [
      headGeometry,
      muzzleGeometry,
      earGeometry,
      eyeGeometry,
      noseGeometry,
      mouthGeometry,
    ];

    return { monkeyHead, geometries };
  }

  /**
   * Create a motion blur effect by creating multiple instances with different opacities
   */
  static createMotionBlurInstances(originalMonkey, blurAmount, material) {
    const instances = [];

    // Create the original instance (fully opaque)
    instances.push(originalMonkey);

    // Create additional instances with decreasing opacity
    for (let i = 1; i < blurAmount; i++) {
      // Clone the original monkey
      const clone = originalMonkey.clone();

      // Create a new material with reduced opacity
      const opacity = 0.7 * (1 - i / blurAmount);
      const blurMaterial = material.clone();
      blurMaterial.transparent = true;
      blurMaterial.opacity = opacity;

      // Apply the material to all children
      clone.traverse((child) => {
        if (child.isMesh && child.material) {
          // Special handling for eyes, nose, and mouth
          if (
            child.material.color &&
            child.material.color.getHex() === 0x000000
          ) {
            const specialMaterial = child.material.clone();
            specialMaterial.transparent = true;
            specialMaterial.opacity = opacity;
            child.material = specialMaterial;
          } else {
            child.material = blurMaterial;
          }
        }
      });

      instances.push(clone);
    }

    return instances;
  }

  /**
   * Set up the scene with the monkey and lighting
   */
  static setupScene(scene) {
    const objects = [];
    const geometries = [];

    // Create materials
    const monkeyMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b4513, // Brown color for the monkey
      shininess: 30,
    });

    // Create the main monkey head
    const { monkeyHead, geometries: monkeyGeometries } =
      this.createMonkeyHead(monkeyMaterial);
    geometries.push(...monkeyGeometries);

    // Create a group to hold all monkey instances
    const monkeyGroup = new THREE.Group();
    monkeyGroup.name = "monkeyGroup";
    scene.add(monkeyGroup);

    // Create motion blur instances
    const blurAmount = 8; // Increased for more dramatic effect
    const monkeyInstances = this.createMotionBlurInstances(
      monkeyHead,
      blurAmount,
      monkeyMaterial
    );

    // Add all instances to the group
    monkeyInstances.forEach((instance) => {
      monkeyGroup.add(instance);
      objects.push(instance);
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const lights = [ambientLight, directionalLight];
    objects.push(...lights);

    return {
      objects,
      geometries,
      lights,
      monkeyGroup,
      monkeyInstances,
      materials: [monkeyMaterial],
    };
  }

  /**
   * Update the positions of the monkey instances to create motion blur effect
   */
  static updateObjects(time, params = {}) {
    const {
      monkeyInstances,
      vibrationSpeed = 8,
      vibrationAmplitude = 0.15,
    } = params;

    if (!monkeyInstances || monkeyInstances.length === 0) return;

    // Calculate base position with more dramatic but slower rotation
    const baseRotationX = Math.sin(time * 0.4) * 0.3;
    const baseRotationY = time * 0.25;

    // Add a bouncing effect (slower)
    const bounceHeight = Math.abs(Math.sin(time * 0.6)) * 0.2;

    // Update each instance with a more dramatic offset
    monkeyInstances.forEach((instance, index) => {
      // Set base rotation for all instances
      instance.rotation.x = baseRotationX;
      instance.rotation.y = baseRotationY;

      // Add some random jitter to the original instance too for more vibration
      if (index === 0) {
        // Subtle jitter for the main instance (slower)
        instance.position.x = Math.sin(time * 10) * 0.02;
        instance.position.y = Math.cos(time * 12) * 0.02 + bounceHeight;
        return;
      }

      // Calculate vibration offset based on time and instance index
      // Use different frequencies for X and Y to create more chaotic motion (slower)
      const offsetPhaseX =
        (time * vibrationSpeed + index * 0.5) % (Math.PI * 2);
      const offsetPhaseY =
        (time * (vibrationSpeed + 2) + index * 0.4) % (Math.PI * 2);

      // More dramatic offsets with some randomization
      const offsetX =
        Math.sin(offsetPhaseX) * vibrationAmplitude * (1 + index * 0.1);
      const offsetY =
        Math.cos(offsetPhaseY) * vibrationAmplitude * (1 + index * 0.08) +
        bounceHeight;

      // Add some Z-axis movement for more 3D effect (slower)
      const offsetZ = Math.sin(time * 4 + index) * 0.05;

      // Apply offset to position
      instance.position.x = offsetX;
      instance.position.y = offsetY;
      instance.position.z = offsetZ;
    });
  }

  /**
   * Initialize the scene
   */
  async init() {
    try {
      const { monkeyGroup, monkeyInstances, lights } =
        MotionBlurMonkey027.setupScene(this.scene);

      this.monkeyGroup = monkeyGroup;
      this.monkeyInstances = monkeyInstances;

      // Add to objects group
      this.objects.add(monkeyGroup);
      lights.forEach((light) => this.objects.add(light));

      // Set camera position
      if (this.scene.userData.camera) {
        this.scene.userData.camera.position.set(0, 0, 5);
        this.scene.userData.camera.lookAt(0, 0, 0);
      }
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  /**
   * Update the scene on each frame
   */
  update(deltaTime) {
    this.time += deltaTime;

    // Update monkey instances to create motion blur effect
    MotionBlurMonkey027.updateObjects(this.time, {
      monkeyInstances: this.monkeyInstances,
      vibrationSpeed: this.vibrationSpeed,
      vibrationAmplitude: this.vibrationAmplitude,
    });
  }

  /**
   * Get camera position for thumbnail
   */
  static getThumbnailCameraPosition() {
    return {
      position: [0, 0, 5],
      target: [0, 0, 0],
    };
  }

  /**
   * Create a preview for the gallery
   */
  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const { monkeyInstances, geometries, materials, objects } =
      this.setupScene(scene);

    let time = 0;

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(time, {
          monkeyInstances,
          vibrationSpeed: 8,
          vibrationAmplitude: 0.15,
        });
        renderer.render(scene, camera);
      },
      dispose: () => {
        // Dispose geometries
        geometries.forEach((g) => g.dispose());

        // Dispose materials
        materials.forEach((m) => m.dispose());

        // Dispose any additional materials on objects
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
   * Generate a thumbnail for the gallery
   */
  static getThumbnailBlob() {
    // Simple SVG representation of a monkey with motion blur
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Motion blur effect (multiple overlapping monkeys with different opacities) -->
        <g opacity="0.3" transform="translate(103, 100)">
          <!-- Monkey head outline -->
          <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
          <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
          
          <!-- Ears -->
          <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          
          <!-- Eyes -->
          <circle cx="-15" cy="-5" r="5" fill="#000000"/>
          <circle cx="15" cy="-5" r="5" fill="#000000"/>
          
          <!-- Nose -->
          <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
          
          <!-- Mouth -->
          <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
        </g>
        
        <g opacity="0.5" transform="translate(101, 100)">
          <!-- Monkey head outline -->
          <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
          <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
          
          <!-- Ears -->
          <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          
          <!-- Eyes -->
          <circle cx="-15" cy="-5" r="5" fill="#000000"/>
          <circle cx="15" cy="-5" r="5" fill="#000000"/>
          
          <!-- Nose -->
          <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
          
          <!-- Mouth -->
          <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
        </g>
        
        <g opacity="0.7" transform="translate(99, 100)">
          <!-- Monkey head outline -->
          <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
          <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
          
          <!-- Ears -->
          <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          
          <!-- Eyes -->
          <circle cx="-15" cy="-5" r="5" fill="#000000"/>
          <circle cx="15" cy="-5" r="5" fill="#000000"/>
          
          <!-- Nose -->
          <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
          
          <!-- Mouth -->
          <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
        </g>
        
        <!-- Main monkey (fully opaque) -->
        <g transform="translate(100, 100)">
          <!-- Monkey head outline -->
          <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
          <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
          
          <!-- Ears -->
          <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
          
          <!-- Eyes -->
          <circle cx="-15" cy="-5" r="5" fill="#000000"/>
          <circle cx="15" cy="-5" r="5" fill="#000000"/>
          
          <!-- Nose -->
          <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
          
          <!-- Mouth -->
          <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
        </g>
      </svg>
    `;

    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);
    return fetch(dataURL).then((res) => res.blob());
  }
}
