import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BrickData {
  mesh: THREE.Mesh;
  initialPos: THREE.Vector3;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  rotation: THREE.Euler;
  mass: number;
  active: boolean;
}

export default function BrickExplosion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const bricksRef = useRef<BrickData[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isMouseDownRef = useRef(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ azimuth: 0, elevation: Math.PI / 6 });
  const resetCameraRef = useRef<(() => void) | null>(null);
  const detonatorRef = useRef<THREE.Mesh | null>(null);
  const triggerExplosionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 6, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Disable antialiasing for better performance
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Faster shadow type
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Further limit pixel ratio
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting - optimized for performance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Increased ambient to reduce shadow calculations
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4); // Reduced intensity
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024; // Reduced shadow map size
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Brick dimensions
    const brickWidth = 0.6;
    const brickHeight = 0.35;
    const brickDepth = 0.4;

     // Ground - Minecraft-style grass (wider than wall)
     const groundGeom = new THREE.PlaneGeometry(30, 30);
     const groundMat = new THREE.MeshStandardMaterial({ 
       color: new THREE.Color().setHSL(0.25, 0.6, 0.4 + Math.random() * 0.1) // Green grass color with variation
     });
     const ground = new THREE.Mesh(groundGeom, groundMat);
     ground.rotation.x = -Math.PI / 2;
     ground.position.y = 0;
     ground.receiveShadow = true;
     scene.add(ground);

    const brickData: BrickData[] = [];

    // Main tower - octagonal structure (3 storeys)
    const towerRadius = 3.25; // Increased by 30%
    const towerHeight = 16; // Slightly taller than walls (12 units) for 3-storey appearance
    const baseBrickRows = Math.floor(towerHeight / brickHeight);
    
    // Octagonal tower - 8 sides with better corner coverage
    const octagonSides = 8;
    const sideLength = 2 * towerRadius * Math.sin(Math.PI / 8);
    const bricksPerSide = Math.ceil(sideLength / (brickWidth * 0.8)); // More bricks for better coverage
    
    // Create octagonal tower with doorway and windows
    const doorwayHeight = 2.5; // Height of doorway in units
    const doorwayWidth = 1.5; // Width of doorway in units
    const doorwayRows = Math.ceil(doorwayHeight / brickHeight);
    
    // Window parameters for level 2
    const windowHeight = 2.0; // Height of windows in units
    const windowWidth = 1.2; // Width of windows in units
    const windowRows = Math.ceil(windowHeight / brickHeight);
    const level2StartRow = Math.floor(baseBrickRows / 3); // Start of second level
    const level2EndRow = level2StartRow + windowRows;
    
    for (let row = 0; row < baseBrickRows; row++) {
      const y = row * brickHeight + brickHeight / 2;
      
      for (let side = 0; side < octagonSides; side++) {
        const sideAngle = (side / octagonSides) * Math.PI * 2;
        const nextSideAngle = ((side + 1) / octagonSides) * Math.PI * 2;
        
        for (let i = 0; i < bricksPerSide; i++) {
          const t = i / bricksPerSide;
          const angle = sideAngle + (nextSideAngle - sideAngle) * t;
          const x = Math.cos(angle) * towerRadius;
          const z = Math.sin(angle) * towerRadius;

          // Check if this brick should be skipped for doorway or windows
          let skipBrick = false;
          
          // Doorway on ground level
          if (row < doorwayRows) {
            // Simple check: if brick is in front center area
            if (Math.abs(x) < doorwayWidth / 2 && z > 0) {
              skipBrick = true;
            }
          }
          
          // Arched windows on level 2
          if (row >= level2StartRow && row < level2EndRow) {
            // Check if brick is in window area (front-facing side)
            if (Math.abs(x) < windowWidth / 2 && z > 0) {
              // Create proper arch shape
              const archRadius = windowWidth / 2;
              const archCenter = level2StartRow + windowRows * 0.8; // Arch starts at 80% height
              
              if (row < archCenter) {
                // Rectangular part - full width
                skipBrick = true;
              } else {
                // Arched part - calculate arch curve
                const archHeight = row - archCenter;
                const archWidth = Math.sqrt(Math.max(0, archRadius * archRadius - archHeight * archHeight));
                if (Math.abs(x) < archWidth) {
                  skipBrick = true;
                }
              }
            }
          }
          
          if (skipBrick) continue;

          const geometry = new THREE.BoxGeometry(brickWidth * 0.8, brickHeight * 0.99, brickDepth);
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.05, 0.8, 0.45 + Math.random() * 0.08),
            roughness: 0.75,
            metalness: 0.05
          });
          const brick = new THREE.Mesh(geometry, material);
          brick.position.set(x, y, z);
          brick.rotation.y = angle;
          brick.castShadow = true;
          brick.receiveShadow = true;

          scene.add(brick);
          
          const initialPos = new THREE.Vector3(x, y, z);
          brickData.push({
            mesh: brick,
            initialPos,
            position: initialPos.clone(),
            velocity: new THREE.Vector3(0, 0, 0),
            angularVelocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, angle, 0),
            mass: 1,
            active: false
          });
        }
      }
    }

    // Add back wall to tower to close it off
    for (let row = 0; row < baseBrickRows; row++) {
      const y = row * brickHeight + brickHeight / 2;
      
      for (let col = 0; col < Math.ceil(towerRadius * 2 / brickWidth); col++) {
        const x = -towerRadius + col * brickWidth;
        const z = -0.5;

        // Color the leftmost and rightmost columns to match main tower
        const isLeftColumn = col === 0;
        const isRightColumn = col === Math.ceil(towerRadius * 2 / brickWidth) - 1;
        
        const geometry = new THREE.BoxGeometry(brickWidth, brickHeight * 0.99, brickDepth);
        const material = new THREE.MeshStandardMaterial({
          color: (isLeftColumn || isRightColumn) 
            ? new THREE.Color().setHSL(0.05, 0.8, 0.45 + Math.random() * 0.08) // Main tower color
            : new THREE.Color(0x000000), // Black for interior
          roughness: 0.75,
          metalness: 0.05
        });
        const brick = new THREE.Mesh(geometry, material);
        brick.position.set(x, y, z);
        brick.castShadow = true;
        brick.receiveShadow = true;

        scene.add(brick);
        
        const initialPos = new THREE.Vector3(x, y, z);
        brickData.push({
          mesh: brick,
          initialPos,
          position: initialPos.clone(),
          velocity: new THREE.Vector3(0, 0, 0),
          angularVelocity: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          mass: 1,
          active: false
        });
      }
    }

    // Add connecting wall from tower (rectangular wall attached to tower)
    const wallLength = 12; // Increased by 50%
    const wallHeight = 12;
    const wallDepth = 1;
    const wallStartX = towerRadius; // Start wall at tower edge
    const wallStartXLeft = -towerRadius - wallLength + brickWidth;
    const wallBricksPerRow = Math.ceil(wallLength / brickWidth);
    const wallRows = Math.ceil(wallHeight / brickHeight);
    
    // TNT Block - Minecraft style
    const tntSize = 1.0;
    const tntGeometry = new THREE.BoxGeometry(tntSize, tntSize, tntSize);
    
    // Create TNT block with red, white, and black materials
    const tntBlock = new THREE.Group();
    
    // Main red body
    const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const redBody = new THREE.Mesh(tntGeometry, redMaterial);
    tntBlock.add(redBody);
    
    // White band around middle
    const whiteBandGeometry = new THREE.BoxGeometry(tntSize, tntSize * 0.2, tntSize * 0.1);
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const whiteBand = new THREE.Mesh(whiteBandGeometry, whiteMaterial);
    whiteBand.position.y = 0;
    whiteBand.position.z = tntSize * 0.45;
    tntBlock.add(whiteBand);
    
    // TNT text (simplified as dark rectangles)
    const textGeometry = new THREE.BoxGeometry(tntSize * 0.15, tntSize * 0.1, tntSize * 0.05);
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    // T
    const tText = new THREE.Mesh(textGeometry, textMaterial);
    tText.position.set(-tntSize * 0.25, 0, tntSize * 0.5);
    tntBlock.add(tText);
    
    // N
    const nText1 = new THREE.Mesh(textGeometry, textMaterial);
    nText1.position.set(0, 0, tntSize * 0.5);
    tntBlock.add(nText1);
    
    // T
    const tText2 = new THREE.Mesh(textGeometry, textMaterial);
    tText2.position.set(tntSize * 0.25, 0, tntSize * 0.5);
    tntBlock.add(tText2);
    
    // Dark top surface
    const topGeometry = new THREE.BoxGeometry(tntSize * 0.8, tntSize * 0.1, tntSize * 0.8);
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const topSurface = new THREE.Mesh(topGeometry, topMaterial);
    topSurface.position.y = tntSize * 0.45;
    tntBlock.add(topSurface);
    
    // Position TNT block in front of left wall
    const leftWallCenter = wallStartXLeft + (wallLength / 2);
    
    tntBlock.position.set(leftWallCenter, tntSize / 2, 2); // Move forward (positive Z)
    tntBlock.castShadow = true;
    tntBlock.receiveShadow = true;
    scene.add(tntBlock);

    // Detonator box near viewer
    const detonatorSize = 0.8;
    const detonatorGeometry = new THREE.BoxGeometry(detonatorSize, detonatorSize * 0.6, detonatorSize * 0.8);
    const detonatorMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red box
    const detonatorBox = new THREE.Mesh(detonatorGeometry, detonatorMaterial);
    
    // Plunger on top
    const plungerGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
    const plungerMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc }); // Silver
    const plunger = new THREE.Mesh(plungerGeometry, plungerMaterial);
    plunger.position.y = detonatorSize * 0.3 + 0.15;
    detonatorBox.add(plunger);
    
    // Handle on plunger
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Black grips
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.2;
    handle.rotation.z = Math.PI / 2;
    plunger.add(handle);
    
    // Position detonator near viewer
    detonatorBox.position.set(8, detonatorSize * 0.3, 8);
    detonatorBox.castShadow = true;
    detonatorBox.receiveShadow = true;
    detonatorRef.current = detonatorBox;
    scene.add(detonatorBox);

    // Wire connecting TNT to detonator (running along ground around tower)
    const wirePoints = [
      new THREE.Vector3(leftWallCenter + tntSize/2, 0.1, 2), // Start at right side of TNT, at ground level
      new THREE.Vector3(leftWallCenter + tntSize/2 + 1, 0.1, 2), // Move away from TNT
      new THREE.Vector3(-6, 0.1, 4), // Go around back of tower
      new THREE.Vector3(6, 0.1, 8), // Come around front
      new THREE.Vector3(8, 0.1, 8), // Along ground to detonator area
      new THREE.Vector3(8, detonatorSize * 0.3, 8) // End at detonator
    ];
    
    const wireGeometry = new THREE.BufferGeometry().setFromPoints(wirePoints);
    const wireMaterial = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 2 });
    const wire = new THREE.Line(wireGeometry, wireMaterial);
    scene.add(wire);
    
    // Build right wall (no doors) - skip center section hidden by tower
    for (let row = 0; row < wallRows; row++) {
      const y = row * brickHeight + brickHeight / 2;
      
      for (let col = 0; col < wallBricksPerRow; col++) {
        const x = wallStartX + col * brickWidth;
        const z = wallDepth / 2;
        
        // Skip wall sections behind tower openings
        if (x < towerRadius) {
          continue;
        }

        const geometry = new THREE.BoxGeometry(brickWidth, brickHeight * 0.99, brickDepth);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.05, 0.8, 0.45 + Math.random() * 0.08),
          roughness: 0.75,
          metalness: 0.05
        });
        const brick = new THREE.Mesh(geometry, material);
        brick.position.set(x, y, z);
        brick.castShadow = true;
        brick.receiveShadow = true;

        scene.add(brick);

        const initialPos = new THREE.Vector3(x, y, z);
        brickData.push({
          mesh: brick,
          initialPos,
          position: initialPos.clone(),
          velocity: new THREE.Vector3(0, 0, 0),
          angularVelocity: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          mass: 1,
          active: false
        });
      }
    }

     // Roman-style roof tiles - completely solid conical cap
     const roofHeight = 2; // Fixed short height
     const roofRows = Math.ceil(roofHeight / brickHeight);
     
     for (let row = 0; row < roofRows; row++) {
       const y = baseBrickRows * brickHeight + row * brickHeight + brickHeight / 2;
       const progress = row / roofRows;
       const currentRadius = towerRadius * (1 - progress); // Linear taper to center point
       
       // Skip if radius is too small
       if (currentRadius < 0.1) continue;
       
       // Calculate how many tiles we need for complete coverage - higher resolution
       const circumference = 2 * Math.PI * currentRadius;
       const tilesNeeded = Math.ceil(circumference / (brickWidth * 0.6)); // Smaller tiles = higher resolution
       
       for (let tileIndex = 0; tileIndex < tilesNeeded; tileIndex++) {
         const angle = (tileIndex / tilesNeeded) * Math.PI * 2;
         const x = Math.cos(angle) * currentRadius;
         const z = Math.sin(angle) * currentRadius;

         // Create smaller roof tile geometry for higher resolution
         const geometry = new THREE.BoxGeometry(brickWidth * 0.7, brickHeight * 0.6, brickDepth * 0.6);
         const material = new THREE.MeshStandardMaterial({
           color: new THREE.Color(0x3f2700), // Very dark brown (#3f2700)
           roughness: 0.8,
           metalness: 0.1
         });
         const tile = new THREE.Mesh(geometry, material);
         tile.position.set(x, y, z);
         tile.rotation.y = angle;
         tile.castShadow = true;
         tile.receiveShadow = true;

         scene.add(tile);

         const initialPos = new THREE.Vector3(x, y, z);
         brickData.push({
           mesh: tile,
           initialPos,
           position: initialPos.clone(),
           velocity: new THREE.Vector3(0, 0, 0),
           angularVelocity: new THREE.Vector3(0, 0, 0),
           rotation: new THREE.Euler(0, angle, 0),
           mass: 1,
           active: false
         });
       }
     }

    // Crenellations (battlements) at top of right wall
    const crenellationHeight = 0.7;
    const battlementRows = Math.ceil(crenellationHeight / brickHeight);
    
    for (let col = 0; col < wallBricksPerRow; col += 2) {
      const x = wallStartX + col * brickWidth;
      const z = wallDepth / 2;

      for (let br = 0; br < battlementRows; br++) {
        const y = wallRows * brickHeight + br * brickHeight + brickHeight / 2;
        
        const geometry = new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.05, 0.85, 0.4 + Math.random() * 0.1),
          roughness: 0.75,
          metalness: 0.05
        });
        const brick = new THREE.Mesh(geometry, material);
        brick.position.set(x, y, z);
        brick.castShadow = true;
        brick.receiveShadow = true;

        scene.add(brick);

        const initialPos = new THREE.Vector3(x, y, z);
        brickData.push({
          mesh: brick,
          initialPos,
          position: initialPos.clone(),
          velocity: new THREE.Vector3(0, 0, 0),
          angularVelocity: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          mass: 1,
          active: false
        });
      }
    }

    // Add left wall (mirror of right wall)

    for (let row = 0; row < wallRows; row++) {
      const y = row * brickHeight + brickHeight / 2;
      
      for (let col = 0; col < wallBricksPerRow; col++) {
        const x = wallStartXLeft + col * brickWidth;
        const z = wallDepth / 2;
        
        // Skip wall sections behind tower openings (left wall)
        if (x > -towerRadius) {
          continue;
        }
        
        // Build left wall (no doors)

        const geometry = new THREE.BoxGeometry(brickWidth, brickHeight * 0.99, brickDepth);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.05, 0.8, 0.45 + Math.random() * 0.08),
          roughness: 0.75,
          metalness: 0.05
        });
        const brick = new THREE.Mesh(geometry, material);
        brick.position.set(x, y, z);
        brick.castShadow = true;
        brick.receiveShadow = true;

        scene.add(brick);

        const initialPos = new THREE.Vector3(x, y, z);
        brickData.push({
          mesh: brick,
          initialPos,
          position: initialPos.clone(),
          velocity: new THREE.Vector3(0, 0, 0),
          angularVelocity: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          mass: 1,
          active: false
        });
      }
    }

    // Crenellations (battlements) at top of left wall
    for (let col = 0; col < wallBricksPerRow; col += 2) {
      const x = wallStartXLeft + col * brickWidth;
      const z = wallDepth / 2;

      for (let br = 0; br < battlementRows; br++) {
        const y = wallRows * brickHeight + br * brickHeight + brickHeight / 2;
        
        const geometry = new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.05, 0.85, 0.4 + Math.random() * 0.1),
          roughness: 0.75,
          metalness: 0.05
        });
        const brick = new THREE.Mesh(geometry, material);
        brick.position.set(x, y, z);
        brick.castShadow = true;
        brick.receiveShadow = true;

        scene.add(brick);

        const initialPos = new THREE.Vector3(x, y, z);
        brickData.push({
          mesh: brick,
          initialPos,
          position: initialPos.clone(),
          velocity: new THREE.Vector3(0, 0, 0),
          angularVelocity: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          mass: 1,
          active: false
        });
      }
    }

    bricksRef.current = brickData;

    const GRAVITY = 9.81;

    // Initialize explosion
    const initializeExplosion = () => {
      brickData.forEach((data, idx) => {
        const velocityVariation = 0.4 + Math.sin(idx * 12.9898) * 0.25;
        data.velocity.set(0, 2.2 + velocityVariation, 0);
        
        const spreadX = (Math.sin(idx * 12.9898) * 0.43358) * 0.3;
        const spreadZ = (Math.sin(idx * 78.233) * 0.43358) * 0.3;
        data.velocity.x = spreadX;
        data.velocity.z = spreadZ;
        
        data.angularVelocity.set(0, 0, 0);
        data.active = true;
      });
    };

    // Physics simulation - optimized for smooth rendering
    const simulatePhysics = (deltaTime: number) => {
      const dt = Math.min(deltaTime, 0.016); // Cap at 60fps for stability
      const velocityScale = dt;
      const gravityForce = GRAVITY * dt;
      let activeBricks = 0;

      brickData.forEach((data) => {
        if (!data.active) return;
        
        activeBricks++;

        // Apply gravity
        data.velocity.y -= gravityForce;
        
        // Update position with cached velocity scale
        data.position.x += data.velocity.x * velocityScale;
        data.position.y += data.velocity.y * velocityScale;
        data.position.z += data.velocity.z * velocityScale;

        // Ground collision with damping
        if (data.position.y <= data.initialPos.y) {
          data.position.y = data.initialPos.y;
          data.velocity.y *= -0.2; // Reduced bounce for faster settling
          data.velocity.x *= 0.7; // Increased horizontal damping
          data.velocity.z *= 0.7;
          
          // Stop very slow bricks more aggressively during settling phase
          if (Math.abs(data.velocity.y) < 0.1 && 
              Math.abs(data.velocity.x) < 0.1 && 
              Math.abs(data.velocity.z) < 0.1) {
            data.position.copy(data.initialPos);
            data.velocity.set(0, 0, 0);
            data.active = false;
            return;
          }
        }

        // Update rotation
        data.rotation.x += data.angularVelocity.x * dt;
        data.rotation.y += data.angularVelocity.y * dt;
        data.rotation.z += data.angularVelocity.z * dt;

        // Apply damping
        data.angularVelocity.multiplyScalar(0.95); // Increased damping

        // Update mesh transforms
        data.mesh.position.copy(data.position);
        data.mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
      });
      
      // Early exit if no active bricks
      if (activeBricks === 0) {
        return;
      }
    };

    // Mouse controls for camera rotation
    const updateCamera = () => {
      if (!cameraRef.current) return;
      
      const camera = cameraRef.current;
      const radius = 20;
      const centerY = 6;
      
      const x = Math.cos(cameraAngleRef.current.azimuth) * Math.cos(cameraAngleRef.current.elevation) * radius;
      const y = Math.sin(cameraAngleRef.current.elevation) * radius + centerY;
      const z = Math.sin(cameraAngleRef.current.azimuth) * Math.cos(cameraAngleRef.current.elevation) * radius;
      
      camera.position.set(x, y, z);
      camera.lookAt(0, centerY, 0);
    };

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDownRef.current = true;
      mousePositionRef.current = { x: event.clientX, y: event.clientY };
      
      // Check if clicking on detonator
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current!);
      
      if (detonatorRef.current) {
        const intersects = raycaster.intersectObject(detonatorRef.current, true);
        if (intersects.length > 0) {
          triggerExplosion();
          return; // Don't start camera rotation
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      
      const deltaX = event.clientX - mousePositionRef.current.x;
      const deltaY = event.clientY - mousePositionRef.current.y;
      
      cameraAngleRef.current.azimuth -= deltaX * 0.01;
      cameraAngleRef.current.elevation -= deltaY * 0.01;
      
      // Constrain elevation to prevent camera flipping
      cameraAngleRef.current.elevation = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleRef.current.elevation));
      
      updateCamera();
      
      mousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const resetCamera = () => {
      if (!cameraRef.current) return;
      
      const camera = cameraRef.current;
      camera.position.set(0, 10, 20);
      camera.lookAt(0, 6, 0);
      
      // Reset the angle refs to match the initial position
      cameraAngleRef.current = { azimuth: 0, elevation: Math.PI / 6 };
    };

    const triggerExplosion = () => {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
    };

    resetCameraRef.current = resetCamera;
    triggerExplosionRef.current = triggerExplosion;

    // Add mouse event listeners
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    let lastTime = Date.now();
    
    const animate = () => {
      requestAnimationFrame(animate);

      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      
      if (!startTimeRef.current) {
        // Animation not started yet - just show static castle
        brickData.forEach((data) => {
          data.active = false;
          data.mesh.position.copy(data.initialPos);
          data.mesh.rotation.copy(data.rotation);
        });
        renderer.render(scene, camera);
        return;
      }
      
      const elapsed = (Date.now() - startTimeRef.current) / 1000;

      if (elapsed < 2) {
        brickData.forEach((data) => {
          data.active = false;
          data.mesh.position.copy(data.initialPos);
          data.mesh.rotation.copy(data.rotation);
        });
      } else if (elapsed < 6) {
        if (elapsed < 2.1) {
          initializeExplosion();
        }
        simulatePhysics(deltaTime);
      } else if (elapsed < 8) {
        simulatePhysics(deltaTime);
        
        // Check if all bricks are settled - end animation early
        const activeBricks = brickData.filter(d => d.active).length;
        if (activeBricks === 0 && elapsed > 4) {
          startTimeRef.current = null;
          return;
        }
      } else {
        // Animation complete - reset for next trigger
        startTimeRef.current = null;
        return;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <button
        onClick={() => resetCameraRef.current?.()}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#4a5568',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2d3748'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a5568'}
      >
        Reset View
      </button>
    </div>
  );
}
