import * as THREE from 'three';

interface CharactersProps {
  scene: THREE.Scene;
}

export function createCharacters({ scene }: CharactersProps) {
  // Create three different character types based on the visual references
  
  // Character 1: Blocky Soldier (based on low-poly reference)
  const soldier1 = createBlockySoldier();
  soldier1.position.set(3, 0.4, 10); // Position further left, at same distance as furthest man
  soldier1.rotation.y = -3 * Math.PI / 4; // Face toward the castle they're about to blow up
  scene.add(soldier1);
  
  // Character 2: Pixel-style Warrior (based on pixel art reference)
  const warrior = createPixelWarrior();
  warrior.position.set(10, 0.4, 10); // Position at same distance as furthest man
  warrior.rotation.y = -3 * Math.PI / 4; // Face toward the castle they're about to blow up
  scene.add(warrior);
  
  // Character 3: Voxel Musketeer (based on voxel reference)
  const musketeer = createVoxelMusketeer();
  musketeer.position.set(8, 0.4, 10); // Position at same distance as furthest man (furthest position)
  musketeer.rotation.y = -3 * Math.PI / 4; // Face toward the castle they're about to blow up
  scene.add(musketeer);
  
  // Add subtle swaying animation to all characters
  const characters = [soldier1, warrior, musketeer];
  const clock = new THREE.Clock();
  
  const animateCharacters = () => {
    const time = clock.getElapsedTime();
    
    characters.forEach((character, index) => {
      // Each character has a slightly different sway timing
      const swaySpeed = 0.8 + index * 0.2;
      const swayAmount = 0.02 + index * 0.01; // Different sway intensities
      
      // Gentle side-to-side sway
      character.rotation.z = Math.sin(time * swaySpeed) * swayAmount;
      
      // Very subtle forward-back lean
      character.rotation.x = Math.sin(time * swaySpeed * 1.3) * (swayAmount * 0.3);
      
      // Maintain original Y rotation with slight variation (all facing toward castle)
      const baseYRotation = -3 * Math.PI / 4; // All characters face toward the castle from outside
      character.rotation.y = baseYRotation + Math.sin(time * swaySpeed * 0.5) * 0.05;
    });
    
    requestAnimationFrame(animateCharacters);
  };
  
  animateCharacters();
  
  return { soldier1, warrior, musketeer };
}

function createBlockySoldier(): THREE.Group {
  const soldier = new THREE.Group();
  
  // Head - light brown square
  const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xDDAB77 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.6;
  head.castShadow = true;
  soldier.add(head);
  
  // Eyes - black squares
  const eyeGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.08, 1.65, 0.16);
  soldier.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.08, 1.65, 0.16);
  soldier.add(rightEye);
  
  // Hat - dark gray
  const hatGeometry = new THREE.BoxGeometry(0.32, 0.15, 0.32);
  const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const hat = new THREE.Mesh(hatGeometry, hatMaterial);
  hat.position.y = 1.75;
  hat.castShadow = true;
  soldier.add(hat);
  
  // Body - blue tunic
  const bodyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.3);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4444AA });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1.0;
  body.castShadow = true;
  soldier.add(body);
  
  // Shoulder pads - gold
  const padGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.1);
  const padMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
  const leftPad = new THREE.Mesh(padGeometry, padMaterial);
  leftPad.position.set(-0.25, 1.35, 0);
  soldier.add(leftPad);
  const rightPad = new THREE.Mesh(padGeometry, padMaterial);
  rightPad.position.set(0.25, 1.35, 0);
  soldier.add(rightPad);
  
  // Arms - red sleeves
  const armGeometry = new THREE.BoxGeometry(0.12, 0.6, 0.12);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xAA4444 });
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.3, 1.1, 0);
  leftArm.castShadow = true;
  soldier.add(leftArm);
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.3, 1.1, 0);
  rightArm.castShadow = true;
  soldier.add(rightArm);
  
  // Hands - light brown
  const handGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const handMaterial = new THREE.MeshStandardMaterial({ color: 0xDDAB77 });
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-0.3, 0.8, 0);
  soldier.add(leftHand);
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(0.3, 0.8, 0);
  soldier.add(rightHand);
  
  
  
  // Upper legs - dark blue
  const upperLegGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333366 });
  const leftUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  leftUpperLeg.position.set(-0.1, 0.25, 0); // Extended down to create overlap
  leftUpperLeg.castShadow = true;
  soldier.add(leftUpperLeg);
  const rightUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  rightUpperLeg.position.set(0.1, 0.25, 0); // Extended down to create overlap
  rightUpperLeg.castShadow = true;
  soldier.add(rightUpperLeg);
  
  // Lower legs - dark blue (overlapping with upper legs to show knees)
  const lowerLegGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
  const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  leftLowerLeg.position.set(-0.1, -0.25, 0); // Extended up to create overlap
  leftLowerLeg.castShadow = true;
  soldier.add(leftLowerLeg);
  const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  rightLowerLeg.position.set(0.1, -0.25, 0); // Extended up to create overlap
  rightLowerLeg.castShadow = true;
  soldier.add(rightLowerLeg);
  
  // Boots - dark brown (at bottom of lower legs)
  const bootGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.3);
  const bootMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
  const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  leftBoot.position.set(-0.1, -0.425, 0.05); // At bottom of lower leg
  soldier.add(leftBoot);
  const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  rightBoot.position.set(0.1, -0.425, 0.05); // At bottom of lower leg
  soldier.add(rightBoot);
  
  // Belt
  const beltGeometry = new THREE.BoxGeometry(0.45, 0.05, 0.32);
  const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
  const belt = new THREE.Mesh(beltGeometry, beltMaterial);
  belt.position.y = 0.6;
  soldier.add(belt);
  
  return soldier;
}

function createPixelWarrior(): THREE.Group {
  const warrior = new THREE.Group();
  
  // Head with helmet
  const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xDDAB77 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.6;
  head.castShadow = true;
  warrior.add(head);
  
  // Helmet - dark gray
  const helmetGeometry = new THREE.BoxGeometry(0.32, 0.25, 0.32);
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
  helmet.position.y = 1.7;
  helmet.castShadow = true;
  warrior.add(helmet);
  
  // Helmet plume - dark blue
  const plumeGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.05);
  const plumeMaterial = new THREE.MeshStandardMaterial({ color: 0x445566 });
  const plume = new THREE.Mesh(plumeGeometry, plumeMaterial);
  plume.position.set(0.1, 1.85, 0);
  plume.rotation.z = Math.PI / 6;
  warrior.add(plume);
  
  // Eyes - dark brown squares
  const eyeGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.04);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.08, 1.65, 0.16);
  warrior.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.08, 1.65, 0.16);
  warrior.add(rightEye);
  
  // Beard - dark brown
  const beardGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.1);
  const beardMaterial = new THREE.MeshStandardMaterial({ color: 0x774411 });
  const beard = new THREE.Mesh(beardGeometry, beardMaterial);
  beard.position.set(0, 1.5, 0.16);
  warrior.add(beard);
  
  // Body - dark gray armor
  const bodyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.3);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1.0;
  body.castShadow = true;
  warrior.add(body);
  
  // Cape - red
  const capeGeometry = new THREE.BoxGeometry(0.6, 1.0, 0.1);
  const capeMaterial = new THREE.MeshStandardMaterial({ color: 0xBB4444 });
  const cape = new THREE.Mesh(capeGeometry, capeMaterial);
  cape.position.set(-0.3, 1.2, -0.2);
  cape.rotation.y = Math.PI / 4;
  cape.castShadow = true;
  warrior.add(cape);
  
  // Arms - dark gray
  const armGeometry = new THREE.BoxGeometry(0.12, 0.6, 0.12);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.3, 1.1, 0);
  leftArm.castShadow = true;
  warrior.add(leftArm);
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.3, 1.1, 0);
  rightArm.castShadow = true;
  warrior.add(rightArm);
  
  // Hands - light brown
  const handGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const handMaterial = new THREE.MeshStandardMaterial({ color: 0xDDAB77 });
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-0.3, 0.8, 0);
  warrior.add(leftHand);
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(0.3, 0.8, 0);
  warrior.add(rightHand);
  
  
  
  // Upper legs - dark gray
  const upperLegGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const leftUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  leftUpperLeg.position.set(-0.1, 0.25, 0); // Extended down to create overlap
  leftUpperLeg.castShadow = true;
  warrior.add(leftUpperLeg);
  const rightUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  rightUpperLeg.position.set(0.1, 0.25, 0); // Extended down to create overlap
  rightUpperLeg.castShadow = true;
  warrior.add(rightUpperLeg);
  
  // Lower legs - dark gray (overlapping with upper legs to show knees)
  const lowerLegGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
  const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  leftLowerLeg.position.set(-0.1, -0.25, 0); // Extended up to create overlap
  leftLowerLeg.castShadow = true;
  warrior.add(leftLowerLeg);
  const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  rightLowerLeg.position.set(0.1, -0.25, 0); // Extended up to create overlap
  rightLowerLeg.castShadow = true;
  warrior.add(rightLowerLeg);
  
  // Boots - dark brown (at bottom of lower legs)
  const bootGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.3);
  const bootMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
  const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  leftBoot.position.set(-0.1, -0.425, 0.05); // At bottom of lower leg
  warrior.add(leftBoot);
  const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  rightBoot.position.set(0.1, -0.425, 0.05); // At bottom of lower leg
  warrior.add(rightBoot);
  
  // Belt - dark brown
  const beltGeometry = new THREE.BoxGeometry(0.45, 0.05, 0.32);
  const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x774411 });
  const belt = new THREE.Mesh(beltGeometry, beltMaterial);
  belt.position.y = 0.6;
  warrior.add(belt);
  
  return warrior;
}

function createVoxelMusketeer(): THREE.Group {
  const musketeer = new THREE.Group();
  
  // Head - light brown
  const headGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xDDAB77 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.6;
  head.castShadow = true;
  musketeer.add(head);
  
  // Eyes - black rectangles
  const eyeGeometry = new THREE.BoxGeometry(0.06, 0.04, 0.04);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.08, 1.65, 0.16);
  musketeer.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.08, 1.65, 0.16);
  musketeer.add(rightEye);
  
  // Helmet - dark gray
  const helmetGeometry = new THREE.BoxGeometry(0.32, 0.2, 0.32);
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
  helmet.position.y = 1.75;
  helmet.castShadow = true;
  musketeer.add(helmet);
  
  // Body - blue tunic
  const bodyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.3);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4444AA });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1.0;
  body.castShadow = true;
  musketeer.add(body);
  
  // Red vest/chest plate
  const vestGeometry = new THREE.BoxGeometry(0.35, 0.6, 0.25);
  const vestMaterial = new THREE.MeshStandardMaterial({ color: 0xAA4444 });
  const vest = new THREE.Mesh(vestGeometry, vestMaterial);
  vest.position.y = 1.1;
  vest.position.z = 0.15;
  musketeer.add(vest);
  
  // Epaulets - gold
  const epauletGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.08);
  const epauletMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
  const leftEpaulet = new THREE.Mesh(epauletGeometry, epauletMaterial);
  leftEpaulet.position.set(-0.2, 1.35, 0.1);
  musketeer.add(leftEpaulet);
  const rightEpaulet = new THREE.Mesh(epauletGeometry, epauletMaterial);
  rightEpaulet.position.set(0.2, 1.35, 0.1);
  musketeer.add(rightEpaulet);
  
  // Arms - blue
  const armGeometry = new THREE.BoxGeometry(0.12, 0.6, 0.12);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x4444AA });
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.3, 1.1, 0);
  leftArm.castShadow = true;
  musketeer.add(leftArm);
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.3, 1.1, 0);
  rightArm.castShadow = true;
  musketeer.add(rightArm);
  
  // Hands - light brown
  const handGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const handMaterial = new THREE.MeshStandardMaterial({ color: 0xDDAB77 });
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-0.3, 0.8, 0);
  musketeer.add(leftHand);
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(0.3, 0.8, 0);
  musketeer.add(rightHand);
  
  
  
  // Upper legs - dark blue
  const upperLegGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333366 });
  const leftUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  leftUpperLeg.position.set(-0.1, 0.25, 0); // Extended down to create overlap
  leftUpperLeg.castShadow = true;
  musketeer.add(leftUpperLeg);
  const rightUpperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
  rightUpperLeg.position.set(0.1, 0.25, 0); // Extended down to create overlap
  rightUpperLeg.castShadow = true;
  musketeer.add(rightUpperLeg);
  
  // Lower legs - dark blue (overlapping with upper legs to show knees)
  const lowerLegGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
  const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  leftLowerLeg.position.set(-0.1, -0.25, 0); // Extended up to create overlap
  leftLowerLeg.castShadow = true;
  musketeer.add(leftLowerLeg);
  const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
  rightLowerLeg.position.set(0.1, -0.25, 0); // Extended up to create overlap
  rightLowerLeg.castShadow = true;
  musketeer.add(rightLowerLeg);
  
  // Boots - dark brown with gold trim (at bottom of lower legs)
  const bootGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.3);
  const bootMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
  const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  leftBoot.position.set(-0.1, -0.425, 0.05); // At bottom of lower leg
  musketeer.add(leftBoot);
  const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
  rightBoot.position.set(0.1, -0.425, 0.05); // At bottom of lower leg
  musketeer.add(rightBoot);
  
  // Gold boot trim
  const trimGeometry = new THREE.BoxGeometry(0.22, 0.03, 0.32);
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
  const leftTrim = new THREE.Mesh(trimGeometry, trimMaterial);
  leftTrim.position.set(-0.1, -0.35, 0.05); // At top of boot
  musketeer.add(leftTrim);
  const rightTrim = new THREE.Mesh(trimGeometry, trimMaterial);
  rightTrim.position.set(0.1, -0.35, 0.05); // At top of boot
  musketeer.add(rightTrim);
  
  // Belt - dark brown
  const beltGeometry = new THREE.BoxGeometry(0.45, 0.05, 0.32);
  const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
  const belt = new THREE.Mesh(beltGeometry, beltMaterial);
  belt.position.y = 0.6;
  musketeer.add(belt);
  
  // Belt buckle - gold
  const buckleGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.02);
  const buckleMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
  const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
  buckle.position.y = 0.63;
  musketeer.add(buckle);
  
  // Scabbard/pouch
  const scabbardGeometry = new THREE.BoxGeometry(0.12, 0.3, 0.08);
  const scabbardMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
  const scabbard = new THREE.Mesh(scabbardGeometry, scabbardMaterial);
  scabbard.position.set(0.25, 0.45, 0.15);
  musketeer.add(scabbard);
  
  return musketeer;
}
