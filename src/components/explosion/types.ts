import * as THREE from 'three';

export interface BrickData {
  mesh: THREE.Mesh;
  initialPos: THREE.Vector3;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  rotation: THREE.Euler;
  mass: number;
  active: boolean;
}
