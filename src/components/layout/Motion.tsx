'use client';

import { createContext, CSSProperties, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Keyframe, registerMotion } from '@/lib/motion/scrollEngine';

const SceneContext = createContext<HTMLElement | null>(null);

interface MotionProps {
  keys: Keyframe[];
  unit?: 'px' | '%';
  pointer?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Elemen yang bergerak mengikuti scroll: di dalam Scene mengikuti adegan, di luar mengikuti posisinya di layar. */
export function Motion({ keys, unit, pointer, className, style, children }: MotionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scene = useContext(SceneContext);
  const spec = useRef({ keys, unit, pointer });

  useEffect(() => {
    if (!ref.current) return;
    return registerMotion(ref.current, { ...spec.current, scene });
  }, [scene]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

interface SceneProps {
  /** Panjang scroll adegan, misalnya "300vh". */
  length: string;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}

/** Adegan yang ditahan di layar selama panjang scroll tertentu. */
export function Scene({ length, className = '', stageClassName = '', children }: SceneProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);

  return (
    <section ref={setElement} className={`scene ${className}`} style={{ '--scene-length': length } as CSSProperties}>
      <div className={`scene-stage ${stageClassName}`}>
        <SceneContext.Provider value={element}>{children}</SceneContext.Provider>
      </div>
    </section>
  );
}
