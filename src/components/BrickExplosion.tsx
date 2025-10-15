import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createCharacters } from './Characters';
import { BrickData } from './explosion/types';
import { playExplosionSound } from './explosion/soundEngine';
import { initializeExplosion, simulatePhysics } from './explosion/physicsEngine';
import { buildCastle } from './explosion/castleBuilder';
import { Button } from '@/components/ui/button';

export default function BrickExplosion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const bricksRef = useRef<BrickData[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isMouseDownRef = useRef(false);
  const isResettingRef = useRef(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ azimuth: Math.PI / 2, elevation: Math.asin(4 / 20) });
  const resetCameraRef = useRef<(() => void) | null>(null);
  const detonatorRef = useRef<THREE.Mesh | null>(null);
  const triggerExplosionRef = useRef<(() => void) | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

    // Build castle (tower, walls, TNT, detonator, wires, clouds)
    const { brickData, detonator } = buildCastle(scene);
    bricksRef.current = brickData;
    detonatorRef.current = detonator;

    // Create characters
    createCharacters({ scene });

    // END OF CASTLE BUILDING - KEEP EVERYTHING BELOW

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
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDownRef.current || isResettingRef.current) return;
      
      const deltaX = event.clientX - mousePositionRef.current.x;
      const deltaY = event.clientY - mousePositionRef.current.y;
      
      cameraAngleRef.current.azimuth -= deltaX * 0.01;
      cameraAngleRef.current.elevation -= deltaY * 0.01;
      cameraAngleRef.current.elevation = Math.max(0.1, Math.min(Math.PI / 2, cameraAngleRef.current.elevation));
      
      updateCamera();
      
      mousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      
      event.preventDefault();
      
      const delta = event.deltaY * 0.01;
      const camera = cameraRef.current;
      
      // Move camera forward/backward based on wheel direction
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      camera.position.addScaledVector(direction, delta);
      
      // Update the angle refs to match the new position
      const radius = camera.position.length();
      const centerY = 6;
      
      cameraAngleRef.current.elevation = Math.asin((camera.position.y - centerY) / radius);
      cameraAngleRef.current.azimuth = Math.atan2(camera.position.z, camera.position.x);
    };

    const resetCamera = () => {
      if (!cameraRef.current) return;
      
      isResettingRef.current = true;
      
      // Reset to initial camera position (same as first paint)
      const camera = cameraRef.current;
      camera.position.set(0, 10, 20);
      camera.lookAt(0, 6, 0);
      
      // Reset the angle refs to match the initial position  
      cameraAngleRef.current = { azimuth: Math.PI / 2, elevation: Math.asin(4 / 20) };
      
      // Clear the resetting flag after a brief delay
      setTimeout(() => {
        isResettingRef.current = false;
      }, 100);
    };

    const triggerExplosion = () => {
      playExplosionSound();
      
      // Always restart the animation when button is clicked
        startTimeRef.current = Date.now();
    };

    resetCameraRef.current = resetCamera;
    triggerExplosionRef.current = triggerExplosion;

    // Add mouse event listeners
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    containerRef.current.addEventListener('wheel', handleWheel);

    let lastTime = Date.now();
    const animate = () => {
      requestAnimationFrame(animate);
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      
      if (!startTimeRef.current) {
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
          initializeExplosion(brickData);
        }
        simulatePhysics(brickData, deltaTime);
      } else if (elapsed < 8) {
        simulatePhysics(brickData, deltaTime);
        
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
      
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  // Listen for fullscreen changes (including ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            <div className="fixed top-5 right-5 flex gap-4 z-50">
              <Button
                onClick={() => resetCameraRef.current?.()}
                variant="secondary"
              >
                Reset View
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="default"
              >
                {isFullscreen ? '⤡ Exit Fullscreen' : '⤢ Fullscreen'}
              </Button>
              <Button
                onClick={() => triggerExplosionRef.current?.()}
                variant="destructive"
              >
                💥 Detonate
              </Button>
            </div>
    </div>
  );
}
