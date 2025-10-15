/**
 * Physics Engine - Responsible for explosion physics simulation
 */

import { BrickData } from './types';

const GRAVITY = 6.0;

export function initializeExplosion(brickData: BrickData[]): void {
  brickData.forEach((data, idx) => {
    const heightFactor = (data.initialPos.y / 16) * 2;
    const velocityVariation = 0.3 + Math.sin(idx * 12.9898) * 0.2;
    const baseVelocity = 1.5 + heightFactor + velocityVariation;
    
    const spreadX = (Math.sin(idx * 12.9898) * 0.43358) * 0.4;
    const spreadZ = (Math.sin(idx * 78.233) * 0.43358) * 0.4;
    
    data.velocity.set(spreadX, baseVelocity, spreadZ);
    data.angularVelocity.set(0, 0, 0);
    data.active = true;
  });
}

export function simulatePhysics(brickData: BrickData[], deltaTime: number): void {
  const dt = Math.min(deltaTime, 0.016);
  const velocityScale = dt;
  const gravityForce = GRAVITY * dt;
  let activeBricks = 0;

  brickData.forEach((data) => {
    if (!data.active) return;
    
    activeBricks++;

    data.velocity.y -= gravityForce;
    
    data.position.x += data.velocity.x * velocityScale;
    data.position.y += data.velocity.y * velocityScale;
    data.position.z += data.velocity.z * velocityScale;

    if (data.position.y <= data.initialPos.y) {
      data.position.y = data.initialPos.y;
      data.velocity.y *= -0.1;
      data.velocity.x *= 0.85;
      data.velocity.z *= 0.85;
      
      if (Math.abs(data.velocity.y) < 0.1 && 
          Math.abs(data.velocity.x) < 0.1 && 
          Math.abs(data.velocity.z) < 0.1) {
        data.position.copy(data.initialPos);
        data.velocity.set(0, 0, 0);
        data.active = false;
        return;
      }
    }

    data.rotation.x += data.angularVelocity.x * dt;
    data.rotation.y += data.angularVelocity.y * dt;
    data.rotation.z += data.angularVelocity.z * dt;

    data.angularVelocity.multiplyScalar(0.95);

    data.mesh.position.copy(data.position);
    data.mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
  });
  
  if (activeBricks === 0) {
    return;
  }
}