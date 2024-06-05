'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, extend, createPortal } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial, useFBO } from '@react-three/drei';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass';
import vertex from './glsl/shader.vert';
import fragment from './glsl/shader.frag';
import { Vector2 } from 'three';

// Extend necessary Three.js classes
extend({ EffectComposer, RenderPass, ShaderPass, UnrealBloomPass });

// Define the custom shader material
const ShaderImpl = shaderMaterial(
  {
    tDiffuse: new THREE.Texture(),
    iResolution: new Vector2(1280, 1280),
  },
  vertex,
  fragment
);

extend({ ShaderImpl });

const Filter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const buffer = useFBO();
  const { scene, camera, gl } = useThree();
  const composer = useRef<EffectComposer>(null!);
  const aspect = useMemo(() => new THREE.Vector2(512, 512), []);
  const viewport = useThree((state) => state.viewport);

  useEffect(() => {
    const effectComposer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const shaderPass = new ShaderPass(new ShaderImpl());

    const unrealBloomPass = new UnrealBloomPass(aspect, 2, 0.8, 0.23);

    effectComposer.addPass(renderPass);
    effectComposer.addPass(shaderPass);
    effectComposer.addPass(unrealBloomPass);

    composer.current = effectComposer;
  }, [gl, scene, camera, aspect]);

  useEffect(() => void composer.current.setSize(viewport.width, viewport.height), [viewport]);

  useFrame(() => {

    // Render the scene to the FBO buffer
    gl.setRenderTarget(buffer);
    gl.setClearColor("#ecedef", 1);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // Apply post-processing to the rendered scene
    composer.current.render();
  }, 1);

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
    </>
  );
}

export default Filter;
