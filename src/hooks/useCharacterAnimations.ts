'use client';

import { useRef, useCallback } from 'react';
import * as THREE from 'three';

export type AnimationType = 'idle' | 'walk';

interface CharacterAnimationState {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3 | null;
  animation: AnimationType;
  walkSpeed: number;
}

const IDLE_BOB_SPEED = 2;
const IDLE_BOB_AMPLITUDE = 0.05;
const WALK_BOB_SPEED = 8;
const WALK_BOB_AMPLITUDE = 0.1;

export function useCharacterAnimations(
  characterId: string,
  initialPosition: [number, number, number],
  initialAnimation: AnimationType = 'idle'
) {
  const stateRef = useRef<CharacterAnimationState>({
    position: new THREE.Vector3(...initialPosition),
    targetPosition: null,
    animation: initialAnimation,
    walkSpeed: 2,
  });

  const timeRef = useRef(0);

  const setTargetPosition = useCallback((target: [number, number, number]) => {
    stateRef.current.targetPosition = new THREE.Vector3(...target);
    stateRef.current.animation = 'walk';
  }, []);

  const update = useCallback((delta: number): THREE.Vector3 => {
    const state = stateRef.current;
    timeRef.current += delta;

    if (state.animation === 'walk' && state.targetPosition) {
      const direction = new THREE.Vector3()
        .subVectors(state.targetPosition, state.position)
        .normalize();
      
      const distance = state.position.distanceTo(state.targetPosition);
      
      if (distance > 0.1) {
        state.position.add(direction.multiplyScalar(state.walkSpeed * delta));
      } else {
        state.position.copy(state.targetPosition);
        state.targetPosition = null;
        state.animation = 'idle';
      }
    }

    return state.position.clone();
  }, []);

  const getBobOffset = useCallback((): number => {
    const state = stateRef.current;
    const time = timeRef.current;

    if (state.animation === 'walk') {
      return Math.sin(time * WALK_BOB_SPEED) * WALK_BOB_AMPLITUDE;
    }
    return Math.sin(time * IDLE_BOB_SPEED) * IDLE_BOB_AMPLITUDE;
  }, []);

  const getCurrentAnimation = useCallback((): AnimationType => {
    return stateRef.current.animation;
  }, []);

  return {
    setTargetPosition,
    update,
    getBobOffset,
    getCurrentAnimation,
  };
}
