/**
 * Castle Builder - Responsible for creating all castle geometry
 * Includes: tower, walls, roof, crenellations, TNT, detonator, wires, clouds
 */

import * as THREE from 'three';
import { BrickData } from './types';

export interface CastleElements {
  brickData: BrickData[];
  detonator: THREE.Mesh;
}

export function buildCastle(scene: THREE.Scene): CastleElements {
  const brickWidth = 0.6;
  const brickHeight = 0.35;
  const brickDepth = 0.4;

  // Ground
  const groundGeom = new THREE.PlaneGeometry(60, 60);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color().setHSL(0.25, 0.6, 0.4 + Math.random() * 0.1)
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  const brickData: BrickData[] = [];

  // Tower parameters
  const towerRadius = 3.25;
  const towerHeight = 16;
  const baseBrickRows = Math.floor(towerHeight / brickHeight);
  
  const octagonSides = 8;
  const sideLength = 2 * towerRadius * Math.sin(Math.PI / 8);
  const bricksPerSide = Math.ceil(sideLength / (brickWidth * 0.8));
  
  const doorwayWidth = 3 * brickWidth * 0.8; // 3 columns wide (center + left + right)
  const doorwayRows = 6; // 6 rows high (rows 3-8 from top)
  const doorwayStartRow = baseBrickRows - 8; // 8 rows from the top
  
  const windowHeight = 2.0;
  const windowWidth = 1.2;
  const windowRows = Math.ceil(windowHeight / brickHeight);
  const level2StartRow = Math.floor(baseBrickRows / 3);
  const level2EndRow = level2StartRow + windowRows;
  
  // Build octagonal tower
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

        let skipBrick = false;
        
        // Bottom doorway - first 13 rows from bottom, 3 columns wide
        if (row < 13) {
          if (Math.abs(x) < doorwayWidth / 2 && z > 0) {
            skipBrick = true;
          }
        }
        
        // Top doorway - 6-11 rows from top, 3 columns wide
        if (row >= doorwayStartRow && row < doorwayStartRow + doorwayRows) {
          if (Math.abs(x) < doorwayWidth / 2 && z > 0) {
            skipBrick = true;
          }
        }
        
        // Second doorway - 13-18 rows from top, 3 columns wide
        const secondDoorwayStartRow = baseBrickRows - 18;
        const secondDoorwayRows = 6;
        if (row >= secondDoorwayStartRow && row < secondDoorwayStartRow + secondDoorwayRows) {
          if (Math.abs(x) < doorwayWidth / 2 && z > 0) {
            skipBrick = true;
          }
        }
        
        // Third doorway - 23-28 rows from top, 3 columns wide
        const middleDoorwayStartRow = baseBrickRows - 28;
        const middleDoorwayRows = 6;
        if (row >= middleDoorwayStartRow && row < middleDoorwayStartRow + middleDoorwayRows) {
          if (Math.abs(x) < doorwayWidth / 2 && z > 0) {
            skipBrick = true;
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

  // Back wall
  for (let row = 0; row < baseBrickRows; row++) {
    const y = row * brickHeight + brickHeight / 2;
    
    for (let col = 0; col < Math.ceil(towerRadius * 2 / brickWidth); col++) {
      const x = -towerRadius + col * brickWidth;
      const z = -0.5;

      const isLeftColumn = col === 0;
      const isRightColumn = col === Math.ceil(towerRadius * 2 / brickWidth) - 1;
      
      const geometry = new THREE.BoxGeometry(brickWidth, brickHeight * 0.99, brickDepth);
      const material = new THREE.MeshStandardMaterial({
        color: (isLeftColumn || isRightColumn) 
          ? new THREE.Color().setHSL(0.05, 0.8, 0.45 + Math.random() * 0.08)
          : new THREE.Color(0x000000),
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

  // Roof
  const roofHeight = 2;
  const roofRows = Math.ceil(roofHeight / brickHeight);
  
  for (let row = 0; row < roofRows; row++) {
    const y = baseBrickRows * brickHeight + row * brickHeight + brickHeight / 2;
    const progress = row / roofRows;
    const currentRadius = towerRadius * (1 - progress);
    
    if (currentRadius < 0.1) continue;
    
    const circumference = 2 * Math.PI * currentRadius;
    const tilesNeeded = Math.ceil(circumference / (brickWidth * 0.6));
    
    for (let tileIndex = 0; tileIndex < tilesNeeded; tileIndex++) {
      const angle = (tileIndex / tilesNeeded) * Math.PI * 2;
      const x = Math.cos(angle) * currentRadius;
      const z = Math.sin(angle) * currentRadius;

      const geometry = new THREE.BoxGeometry(brickWidth * 0.7, brickHeight * 0.6, brickDepth * 0.6);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3f2700),
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

  // Walls
  const wallLength = 35;
  const wallHeight = 12;
  const wallDepth = 1;
  const wallStartX = towerRadius;
  const wallStartXLeft = -towerRadius - wallLength + brickWidth;
  const wallBricksPerRow = Math.ceil(wallLength / brickWidth);
  const wallRows = Math.ceil(wallHeight / brickHeight);

  // Right wall
  for (let row = 0; row < wallRows; row++) {
    const y = row * brickHeight + brickHeight / 2;
    
    for (let col = 0; col < wallBricksPerRow; col++) {
      const x = wallStartX + col * brickWidth;
      const z = wallDepth / 2;
      
      if (x < towerRadius) continue;

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

  // Right wall crenellations
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

  // Left wall
  for (let row = 0; row < wallRows; row++) {
    const y = row * brickHeight + brickHeight / 2;
    
    for (let col = 0; col < wallBricksPerRow; col++) {
      const x = wallStartXLeft + col * brickWidth;
      const z = wallDepth / 2;
      
      if (x > -towerRadius) continue;
      
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

  // Left wall crenellations
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

  // TNT blocks
  const tntSize = 1.0;
  const tntGeometry = new THREE.BoxGeometry(tntSize, tntSize, tntSize);
  
  const tntBlock = new THREE.Group();
  
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const redBody = new THREE.Mesh(tntGeometry, redMaterial);
  tntBlock.add(redBody);
  
  const whiteBandGeometry = new THREE.BoxGeometry(tntSize, tntSize * 0.2, tntSize * 0.1);
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const whiteBand = new THREE.Mesh(whiteBandGeometry, whiteMaterial);
  whiteBand.position.y = 0;
  whiteBand.position.z = tntSize * 0.45;
  tntBlock.add(whiteBand);
  
  const textGeometry = new THREE.BoxGeometry(tntSize * 0.15, tntSize * 0.1, tntSize * 0.05);
  const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  const tText = new THREE.Mesh(textGeometry, textMaterial);
  tText.position.set(-tntSize * 0.25, 0, tntSize * 0.5);
  tntBlock.add(tText);
  
  const nText1 = new THREE.Mesh(textGeometry, textMaterial);
  nText1.position.set(0, 0, tntSize * 0.5);
  tntBlock.add(nText1);
  
  const tText2 = new THREE.Mesh(textGeometry, textMaterial);
  tText2.position.set(tntSize * 0.25, 0, tntSize * 0.5);
  tntBlock.add(tText2);
  
  const topGeometry = new THREE.BoxGeometry(tntSize * 0.8, tntSize * 0.1, tntSize * 0.8);
  const topMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const topSurface = new THREE.Mesh(topGeometry, topMaterial);
  topSurface.position.y = tntSize * 0.45;
  tntBlock.add(topSurface);
  
  const leftWallCenter = wallStartXLeft + (wallLength / 2);
  
  tntBlock.position.set(leftWallCenter, tntSize / 2, 2);
  tntBlock.castShadow = true;
  tntBlock.receiveShadow = true;
  scene.add(tntBlock);

  const tntBlock2 = tntBlock.clone();
  const rightWallCenter = wallStartX + (wallLength / 2);
  tntBlock2.position.set(rightWallCenter, tntSize / 2, 2);
  tntBlock2.castShadow = true;
  tntBlock2.receiveShadow = true;
  scene.add(tntBlock2);

  // Detonator
  const detonatorSize = 0.8;
  const detonatorGeometry = new THREE.BoxGeometry(detonatorSize, detonatorSize * 0.6, detonatorSize * 0.8);
  const detonatorMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const detonatorBox = new THREE.Mesh(detonatorGeometry, detonatorMaterial);
  
  const plungerGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
  const plungerMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const plunger = new THREE.Mesh(plungerGeometry, plungerMaterial);
  plunger.position.y = detonatorSize * 0.3 + 0.15;
  detonatorBox.add(plunger);
  
  const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.y = 0.2;
  handle.rotation.z = Math.PI / 2;
  plunger.add(handle);

  detonatorBox.position.set(8, detonatorSize * 0.3, 8);
  detonatorBox.castShadow = true;
  detonatorBox.receiveShadow = true;
  scene.add(detonatorBox);

  // Wires
  const wirePoints = [
    new THREE.Vector3(leftWallCenter + tntSize/2, 0.1, 2),
    new THREE.Vector3(leftWallCenter + tntSize/2 + 1, 0.1, 2),
    new THREE.Vector3(-6, 0.1, 4),
    new THREE.Vector3(6, 0.1, 8),
    new THREE.Vector3(8, 0.1, 8),
    new THREE.Vector3(8, detonatorSize * 0.3, 8)
  ];
  
  const wireGeometry = new THREE.BufferGeometry().setFromPoints(wirePoints);
  const wireMaterial = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 2 });
  const wire = new THREE.Line(wireGeometry, wireMaterial);
  scene.add(wire);

  const wire2Points = [
    new THREE.Vector3(rightWallCenter + tntSize/2, 0.1, 2),
    new THREE.Vector3(rightWallCenter + tntSize/2 + 1, 0.1, 2),
    new THREE.Vector3(6, 0.1, 8),
    new THREE.Vector3(8, 0.1, 8),
    new THREE.Vector3(8, detonatorSize * 0.3, 8)
  ];
  
  const wire2Geometry = new THREE.BufferGeometry().setFromPoints(wire2Points);
  const wire2Material = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 2 });
  const wire2 = new THREE.Line(wire2Geometry, wire2Material);
  scene.add(wire2);

  // Clouds
  const createCloud = (x: number, y: number, z: number, scale: number) => {
    const cloud = new THREE.Group();
    
    const mainBodyGeometry = new THREE.SphereGeometry(scale * 0.8, 8, 6);
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const mainBody = new THREE.Mesh(mainBodyGeometry, cloudMaterial);
    mainBody.position.set(0, 0, 0);
    cloud.add(mainBody);
    
    const puffGeometry = new THREE.SphereGeometry(scale * 0.5, 6, 4);
    const puff1 = new THREE.Mesh(puffGeometry, cloudMaterial);
    puff1.position.set(scale * 0.6, scale * 0.3, 0);
    cloud.add(puff1);
    
    const puff2 = new THREE.Mesh(puffGeometry, cloudMaterial);
    puff2.position.set(-scale * 0.5, scale * 0.2, scale * 0.4);
    cloud.add(puff2);
    
    const puff3 = new THREE.Mesh(puffGeometry, cloudMaterial);
    puff3.position.set(scale * 0.2, -scale * 0.3, scale * 0.3);
    cloud.add(puff3);
    
    const puff4 = new THREE.Mesh(puffGeometry, cloudMaterial);
    puff4.position.set(-scale * 0.3, -scale * 0.1, -scale * 0.4);
    cloud.add(puff4);
    
    cloud.position.set(x, y, z);
    return cloud;
  };
  
  const clouds = [
    createCloud(-8, 15, -5, 2.5),
    createCloud(12, 18, -3, 3.0),
    createCloud(-2, 22, -8, 2.0),
    createCloud(8, 16, 2, 2.8),
    createCloud(-15, 20, 1, 3.2),
    createCloud(18, 14, -6, 2.3),
  ];
  
  clouds.forEach(cloud => scene.add(cloud));

  return { brickData, detonator: detonatorBox };
}
