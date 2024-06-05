'use client'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig';
import Filter from '@/components/Filter';
import { Headline } from "@/components/Text";

export default function Page() {
  const eventSource = useRef();
  return (
    <div ref={eventSource}>
      <GlobalCanvas onCreated={(state) => (state.gl.toneMapping = THREE.AgXToneMapping)}>
        {(globalChildren) => (
          <>
            <Suspense fallback={null}>
              <Filter>
                {globalChildren}
              </Filter>
            </Suspense>
          </>
        )}
      </GlobalCanvas>
      <SmoothScrollbar config={{syncTouch: true}} />
      <article>

        <header className="container">
          <div className="text-center">
            <h2 className='-z-10 text-6xl'>
              <Headline>
                TEST TEST TEST
              </Headline>
            </h2>
          </div>
        </header>
      </article>
    </div>
  )
}
