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
    iResolution: new Vector2(512, 512),
    time: 0,
  },
  vertex,
  fragment
);

extend({ ShaderImpl });

const Filter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const buffer = useFBO();
  const { scene: mainScene, camera: mainCamera, gl, size } = useThree();
  const [offscreenScene] = useState(() => new THREE.Scene());
  const composer = useRef<EffectComposer>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const aspect = useMemo(() => new THREE.Vector2(512, 512), []);

  useEffect(() => {
    const effectComposer = new EffectComposer(gl);
    const renderPass = new RenderPass(offscreenScene, mainCamera);
    const shaderPass = new ShaderPass(new ShaderImpl());
    shaderRef.current = shaderPass.material;

    const unrealBloomPass = new UnrealBloomPass(aspect, 2, 0.8, 0.23);

    effectComposer.addPass(renderPass);
    effectComposer.addPass(shaderPass);
    effectComposer.addPass(unrealBloomPass);

    composer.current = effectComposer;
  }, [gl, offscreenScene, mainCamera, aspect]);

  useEffect(() => {
    const { width, height } = size;
    composer.current.setSize(width, height);
    if (shaderRef.current) {
      shaderRef.current.uniforms.iResolution.value.set(width, height);
    }
  }, [size]);

  useFrame((state, delta) => {
    // Render the offscreen scene to the FBO buffer
    gl.setRenderTarget(buffer);
    gl.setClearColor("#ecedef");
    gl.render(offscreenScene, mainCamera);
    gl.setRenderTarget(null);

    // Update shader uniforms
    if (shaderRef.current) {
      shaderRef.current.uniforms.time.value += delta;
    }

    // Apply post-processing to the rendered scene
    composer.current.render();
  });

  return (
    <>
      {createPortal(children, offscreenScene)}
      <mesh scale={[size.width, size.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
    </>
  );
}

export default Filter;
