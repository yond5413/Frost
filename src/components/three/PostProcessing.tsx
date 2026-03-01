'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Vignette, Noise, ChromaticAberration, Bloom, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { Vector2 } from 'three';
import { useGameStore } from '@/lib/store';

export default function PostProcessing() {
  const fearLevel = useGameStore((s) => s.fearLevel);
  const jumpScareActive = useGameStore((s) => s.jumpScareActive);

  // Derived intensities from fear level (0-100)
  const vignetteOffset = 0.3;
  const vignetteDarkness = Math.min(0.7, fearLevel / 150);

  const noiseOpacity = fearLevel > 30 ? Math.min(0.12, fearLevel / 300) : 0;

  const chromaticOffset = useRef(new Vector2(0, 0));
  useFrame(() => {
    if (jumpScareActive) {
      chromaticOffset.current.set(0.008, 0.008);
    } else if (fearLevel > 70) {
      chromaticOffset.current.set(0.001, 0.001);
    } else {
      chromaticOffset.current.set(0, 0);
    }
  });

  const bloomIntensity = jumpScareActive ? 3.0 : 0.3;

  return (
    <EffectComposer>
      <Vignette
        offset={vignetteOffset}
        darkness={vignetteDarkness}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        opacity={noiseOpacity}
        blendFunction={BlendFunction.SCREEN}
      />
      <ChromaticAberration
        offset={chromaticOffset.current}
        blendFunction={BlendFunction.NORMAL}
      />
      <Bloom
        luminanceThreshold={0.9}
        intensity={bloomIntensity}
        blendFunction={BlendFunction.SCREEN}
      />
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
      />
    </EffectComposer>
  );
}
