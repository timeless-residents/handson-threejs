import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class CeilingLightRoom028 extends UseCaseBase {
  static metadata = {
    id: "028",
    title: "天井ライトと反射床",
    description: "天井ライトだけある空間を作り、床に反射と小さめスペキュラを設定",
    categories: ["Lighting", "Materials", "Reflection"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    
    // Create a group to hold all objects
    this.objects = new THREE.Group();
    scene.add(this.objects);
  }

  /**
   * Create the room with ceiling light and reflective floor
   */
  static createRoom(width = 10, height = 5, depth = 10) {
    const roomGroup = new THREE.Group();
    roomGroup.name = "room";
    
    const geometries = [];
    const materials = [];
    
    // Create reflective floor with subtle specular highlights
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    geometries.push(floorGeometry);
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.3,       // Lower roughness for more reflection
      metalness: 0.2,       // Some metalness for subtle reflections
      envMapIntensity: 1.0  // Intensity of reflection
    });
    materials.push(floorMaterial);
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    floor.position.y = -height / 2;
    roomGroup.add(floor);
    
    // Create walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.9,
      metalness: 0.0
    });
    materials.push(wallMaterial);
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(width, height);
    geometries.push(backWallGeometry);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = -depth / 2;
    roomGroup.add(backWall);
    
    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(depth, height);
    geometries.push(leftWallGeometry);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -width / 2;
    roomGroup.add(leftWall);
    
    // Right wall
    const rightWallGeometry = new THREE.PlaneGeometry(depth, height);
    geometries.push(rightWallGeometry);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = width / 2;
    roomGroup.add(rightWall);
    
    // Ceiling (with hole for light)
    const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
    geometries.push(ceilingGeometry);
    const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height / 2;
    roomGroup.add(ceiling);
    
    // Simple ceiling light fixture
    const lightFixtureGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    geometries.push(lightFixtureGeometry);
    
    const lightFixtureMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffcc,
      emissiveIntensity: 0.5
    });
    materials.push(lightFixtureMaterial);
    
    const lightFixture = new THREE.Mesh(lightFixtureGeometry, lightFixtureMaterial);
    lightFixture.position.y = height / 2 - 0.1;
    roomGroup.add(lightFixture);
    
    // Add some objects to show reflections
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    geometries.push(sphereGeometry);
    
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x6688cc,
      roughness: 0.2,
      metalness: 0.8
    });
    materials.push(sphereMaterial);
    
    // Create some spheres at different positions
    const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere1.position.set(-2, -height / 2 + 0.5, -1);
    roomGroup.add(sphere1);
    
    const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere2.position.set(1.5, -height / 2 + 0.5, 0);
    roomGroup.add(sphere2);
    
    // Create a cube
    const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    geometries.push(cubeGeometry);
    
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc6644,
      roughness: 0.3,
      metalness: 0.5
    });
    materials.push(cubeMaterial);
    
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, -height / 2 + 0.4, -3);
    roomGroup.add(cube);
    
    return { 
      roomGroup, 
      geometries, 
      materials,
      objects: [floor, backWall, leftWall, rightWall, ceiling, lightFixture, sphere1, sphere2, cube] 
    };
  }

  /**
   * Set up the scene with the room and lighting
   */
  static setupScene(scene) {
    const objects = [];
    const geometries = [];
    const materials = [];
    
    // Create the room
    const { roomGroup, geometries: roomGeometries, materials: roomMaterials, objects: roomObjects } = 
      this.createRoom();
    
    geometries.push(...roomGeometries);
    materials.push(...roomMaterials);
    objects.push(...roomObjects);
    
    // Add the room group to the scene
    scene.add(roomGroup);
    objects.push(roomGroup);
    
    // Add lighting - ceiling light (spotlight pointing down)
    const spotLight = new THREE.SpotLight(0xffffcc, 100);
    spotLight.position.set(0, 2.5, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 2;
    spotLight.distance = 10;
    spotLight.castShadow = true;
    
    // Optimize shadow map
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 20;
    
    scene.add(spotLight);
    objects.push(spotLight);
    
    // Add very dim ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    objects.push(ambientLight);
    
    // Enable shadows for all objects
    roomObjects.forEach(obj => {
      obj.castShadow = true;
      obj.receiveShadow = true;
    });
    
    return {
      objects,
      geometries,
      materials,
      lights: [spotLight, ambientLight],
      roomGroup
    };
  }
  
  /**
   * Animate the objects in the scene
   */
  static updateObjects(time, params = {}) {
    const { roomGroup } = params;
    
    if (!roomGroup) return;
    
    // Find and animate the spheres and cube
    roomGroup.children.forEach(child => {
      if (child.geometry && (
          child.geometry.type === 'SphereGeometry' || 
          child.geometry.type === 'BoxGeometry')) {
        
        // Make objects hover slightly
        const initialY = child.position.y;
        child.position.y = initialY + Math.sin(time * 0.5 + child.position.x) * 0.05;
        
        // And rotate slowly
        child.rotation.y = time * 0.3;
        child.rotation.x = time * 0.2;
      }
    });
  }

  /**
   * Initialize the scene
   */
  async init() {
    try {
      const { roomGroup, lights } = CeilingLightRoom028.setupScene(this.scene);
      
      this.roomGroup = roomGroup;
      
      // Add to objects group
      this.objects.add(roomGroup);
      lights.forEach(light => this.objects.add(light));
      
      // Set camera position
      if (this.scene.userData.camera) {
        this.scene.userData.camera.position.set(0, 0, 5);
        this.scene.userData.camera.lookAt(0, 0, 0);
      }
      
      // Enable shadows for renderer
      if (this.scene.userData.renderer) {
        this.scene.userData.renderer.shadowMap.enabled = true;
        this.scene.userData.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    
    // Update animations
    CeilingLightRoom028.updateObjects(this.time, {
      roomGroup: this.roomGroup
    });
  }

  /**
   * Get camera position for thumbnail
   */
  static getThumbnailCameraPosition() {
    return {
      position: [4, 1, 4],
      target: [0, -1, -1],
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 1, 4);
    camera.lookAt(0, -1, -1);
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    const { roomGroup, geometries, materials, objects } = this.setupScene(scene);
    
    let time = 0;
    
    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(time, { roomGroup });
        renderer.render(scene, camera);
      },
      dispose: () => {
        // Dispose geometries
        geometries.forEach(g => g.dispose());
        
        // Dispose materials
        materials.forEach(m => m.dispose());
        
        // Dispose any additional materials on objects
        objects.forEach(obj => {
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(mat => mat.dispose());
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
    // Simple SVG representation of a room with ceiling light and reflective floor
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Room outline -->
        <polygon points="40,60 40,160 160,160 160,60" fill="none" stroke="#555555" stroke-width="2"/>
        
        <!-- Floor with reflection -->
        <rect x="40" y="160" width="120" height="30" fill="#444444"/>
        <rect x="40" y="160" width="120" height="30" fill="url(#reflection)" opacity="0.3"/>
        
        <!-- Ceiling light -->
        <circle cx="100" cy="60" r="15" fill="#ffffcc" opacity="0.9"/>
        <circle cx="100" cy="60" r="10" fill="#ffffff"/>
        
        <!-- Light cone -->
        <polygon points="90,60 110,60 140,160 60,160" fill="#ffffcc" opacity="0.1"/>
        
        <!-- Objects casting reflections -->
        <circle cx="70" cy="150" r="10" fill="#6688cc"/>
        <rect x="95" cy="145" width="15" height="15" fill="#cc6644"/>
        <circle cx="130" cy="150" r="10" fill="#6688cc"/>
        
        <!-- Reflections -->
        <circle cx="70" cy="170" r="10" fill="#6688cc" opacity="0.3"/>
        <rect x="95" cy="165" width="15" height="15" fill="#cc6644" opacity="0.3" transform="scale(1,-0.5)"/>
        <circle cx="130" cy="170" r="10" fill="#6688cc" opacity="0.3"/>
        
        <!-- Reflection gradient -->
        <defs>
          <linearGradient id="reflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
          </linearGradient>
        </defs>
      </svg>
    `;
    
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);
    return fetch(dataURL).then(res => res.blob());
  }
}