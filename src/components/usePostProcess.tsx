'use client';
import React, { useEffect, useMemo, useRef } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import vertex from './glsl/shader.vert';
import fragment from './glsl/shader.frag';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { Vector2 } from 'three';

// Extend necessary Three.js classes
extend({ EffectComposer, RenderPass, ShaderPass, UnrealBloomPass });

// Define the custom shader material
const ShaderImpl = shaderMaterial(
  {
    tDiffuse: new THREE.Texture(),
    iResolution: new Vector2(512, 512),
    time: 0,
  },
  vertex,
  fragment
);

extend({ ShaderImpl });

const Effects: React.FC = () => {
  const composer = useRef<EffectComposer>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const { size, scene, camera, gl } = useThree();
  const aspect = useMemo(() => new THREE.Vector2(512, 512), []);

  useEffect(() => {
    const effectComposer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const shaderPass = new ShaderPass(new ShaderImpl());
    shaderRef.current = shaderPass.material;

    const unrealBloomPass = new UnrealBloomPass(aspect, 2, 0.8, 0.23);

    effectComposer.addPass(renderPass);
    effectComposer.addPass(shaderPass);
    effectComposer.addPass(unrealBloomPass);

    composer.current = effectComposer;
  }, [gl, scene, camera, aspect]);

  useEffect(() => {
    const { width, height } = size;
    composer.current.setSize(width, height);
    if (shaderRef.current) {
      shaderRef.current.uniforms.iResolution.value.set(width, height);
    }
  }, [size]);

  useFrame((_, delta) => {
    if (composer.current) {
      if (shaderRef.current) {
        shaderRef.current.uniforms.time.value += delta;
      }
      composer.current.render();
    }
  });

  return <primitive object={composer.current} />;
};

export default Effects;