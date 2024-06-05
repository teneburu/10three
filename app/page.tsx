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
      <GlobalCanvas
        debug={true}
        scaleMultiplier={0.5}
        eventSource={eventSource}
        eventPrefix='client'
        style={{width: '100%', height: '100%', pointerEvents: 'none', }}>
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
      <Headline> I WANT TO BE PIXELATED</Headline>
    </div>
  )
}
