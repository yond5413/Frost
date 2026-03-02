import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/lib/store';

const MOVE_SPEED = 4; // units per second

const SCENE_BOUNDS: Record<string, { x: [number, number]; z: [number, number] }> = {
  cabin: { x: [-4, 4],   z: [-3, 4]   },
  lodge: { x: [-8, 8],   z: [-8, 8]   },
  woods: { x: [-12, 12], z: [-12, 12] },
  mines: { x: [-6, 6],   z: [-10, 10] },
};
const DEFAULT_BOUNDS = { x: [-15, 15] as [number, number], z: [-15, 15] as [number, number] };

export default function PlayerController() {
  const { activeCharacter, characterPositions, setCharacterPosition, setCharacterAnimation, phase, currentEnvironment } = useGameStore();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const lastUpdateRef = useRef(0);

  // Only active when scene is in exploration phase
  const isExploration = phase === 'exploration';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup' || k === 'a' || k === 'arrowleft' || k === 's' || k === 'arrowdown' || k === 'd' || k === 'arrowright') {
        setKeys(prev => ({ ...prev, [k]: true }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup' || k === 'a' || k === 'arrowleft' || k === 's' || k === 'arrowdown' || k === 'd' || k === 'arrowright') {
        setKeys(prev => ({ ...prev, [k]: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!isExploration || !activeCharacter) return;

    const now = performance.now() / 1000;
    const dt = now - lastUpdateRef.current;
    lastUpdateRef.current = now;

    let frameDt = dt;
    if (frameDt <= 0) frameDt = delta; // fallback

    const pos = characterPositions[activeCharacter];
    if (!pos) return;

    let dx = 0;
    let dz = 0;
    if (keys['w'] || keys['arrowup']) dz -= 1;
    if (keys['s'] || keys['arrowdown']) dz += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 || dz !== 0) {
      const length = Math.sqrt(dx * dx + dz * dz);
      dx /= length;
      dz /= length;

      const newX = pos.x + dx * MOVE_SPEED * frameDt;
      const newZ = pos.z + dz * MOVE_SPEED * frameDt;

      const bounds = SCENE_BOUNDS[currentEnvironment] ?? DEFAULT_BOUNDS;
      const clampedX = Math.max(bounds.x[0], Math.min(bounds.x[1], newX));
      const clampedZ = Math.max(bounds.z[0], Math.min(bounds.z[1], newZ));

      setCharacterPosition(activeCharacter, { x: clampedX, y: pos.y, z: clampedZ });
      setCharacterAnimation(activeCharacter, 'walk');
    } else {
      // Ensure idle when not moving
      setCharacterAnimation(activeCharacter, 'idle');
    }
  });

  return null;
}