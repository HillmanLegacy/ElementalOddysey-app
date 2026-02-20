import { useEffect, useRef } from "react";

const imageCache = new Map<string, HTMLImageElement>();

function preloadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
  });
}

interface SpriteAnimatorProps {
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  fps?: number;
  scale?: number;
  loop?: boolean;
  flipX?: boolean;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  preloadSheets?: string[];
  startFrame?: number;
  pauseAtFrame?: number;
}

export default function SpriteAnimator({
  spriteSheet,
  frameWidth,
  frameHeight,
  totalFrames,
  fps = 10,
  scale = 3,
  loop = true,
  flipX = false,
  onComplete,
  className = "",
  style,
  preloadSheets,
  startFrame,
  pauseAtFrame,
}: SpriteAnimatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const stoppedRef = useRef(false);
  const mountedSheetRef = useRef("");

  const propsRef = useRef({ spriteSheet, totalFrames, fps, loop, flipX, onComplete, pauseAtFrame, frameWidth, frameHeight, scale });
  propsRef.current = { spriteSheet, totalFrames, fps, loop, flipX, onComplete, pauseAtFrame, frameWidth, frameHeight, scale };

  useEffect(() => {
    if (preloadSheets) {
      preloadSheets.forEach(src => preloadImage(src));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const displayW = Math.round(frameWidth * scale);
    const displayH = Math.round(frameHeight * scale);

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.style.imageRendering = "pixelated";
      canvas.style.display = "block";
      container.appendChild(canvas);
      canvasRef.current = canvas;
    }

    canvas.width = displayW;
    canvas.height = displayH;
    canvas.style.width = displayW + "px";
    canvas.style.height = displayH + "px";

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctxRef.current = ctx;

    const sheetChanged = mountedSheetRef.current !== spriteSheet;
    mountedSheetRef.current = spriteSheet;

    if (sheetChanged || stoppedRef.current) {
      frameRef.current = startFrame ?? 0;
      lastTimeRef.current = 0;
    }
    stoppedRef.current = false;

    const initialFrame = frameRef.current;
    let currentImage: HTMLImageElement | null = imageCache.get(spriteSheet) || null;

    const drawFrame = (img: HTMLImageElement, frame: number) => {
      const { frameWidth: cfw, frameHeight: cfh, flipX: cfx, scale: csc } = propsRef.current;
      const dw = Math.round(cfw * csc);
      const dh = Math.round(cfh * csc);
      const cols = Math.floor(img.naturalWidth / cfw);
      const col = cols > 0 ? frame % cols : frame;
      const row = cols > 0 ? Math.floor(frame / cols) : 0;
      ctx.clearRect(0, 0, dw, dh);
      ctx.save();
      if (cfx) {
        ctx.scale(-1, 1);
        ctx.translate(-dw, 0);
      }
      ctx.drawImage(img, col * cfw, row * cfh, cfw, cfh, 0, 0, dw, dh);
      ctx.restore();
    };

    if (currentImage) {
      drawFrame(currentImage, initialFrame);
    } else {
      preloadImage(spriteSheet).then(img => {
        if (!stoppedRef.current) {
          currentImage = img;
          drawFrame(img, initialFrame);
        }
      });
    }

    const render = (timestamp: number) => {
      if (stoppedRef.current) return;

      const { totalFrames: tf, fps: f, loop: l, onComplete: oc, pauseAtFrame: paf } = propsRef.current;
      const interval = 1000 / f;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;

      if (!currentImage) {
        const cached = imageCache.get(propsRef.current.spriteSheet);
        if (cached) currentImage = cached;
      }

      if (delta >= interval && currentImage) {
        lastTimeRef.current = timestamp - (delta % interval);
        const currentFrame = Math.min(frameRef.current, tf - 1);
        drawFrame(currentImage, currentFrame);

        if (paf !== undefined && currentFrame >= paf) {
          stoppedRef.current = true;
          oc?.();
          return;
        }

        frameRef.current++;
        if (frameRef.current >= tf) {
          if (l) {
            frameRef.current = 0;
          } else {
            frameRef.current = tf - 1;
            stoppedRef.current = true;
            oc?.();
            return;
          }
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      stoppedRef.current = true;
      cancelAnimationFrame(animRef.current);
    };
  }, [spriteSheet, startFrame]);

  useEffect(() => {
    return () => {
      if (canvasRef.current && containerRef.current) {
        try { containerRef.current.removeChild(canvasRef.current); } catch {}
        canvasRef.current = null;
        ctxRef.current = null;
      }
    };
  }, []);

  const displayW = Math.round(frameWidth * scale);
  const displayH = Math.round(frameHeight * scale);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: displayW,
        height: displayH,
        overflow: "hidden",
        ...(style || {}),
      }}
    />
  );
}
