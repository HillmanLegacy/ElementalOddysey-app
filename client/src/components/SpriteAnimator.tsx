import { useEffect, useRef, useCallback } from "react";

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
  style = {},
  preloadSheets,
  startFrame,
  pauseAtFrame,
}: SpriteAnimatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const stoppedRef = useRef(false);

  const propsRef = useRef({ spriteSheet, totalFrames, fps, loop, flipX, onComplete, pauseAtFrame });
  propsRef.current = { spriteSheet, totalFrames, fps, loop, flipX, onComplete, pauseAtFrame };

  useEffect(() => {
    if (preloadSheets) {
      preloadSheets.forEach(src => preloadImage(src));
    }
  }, []);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, frame: number, dw: number, dh: number, flip: boolean) => {
    ctx.clearRect(0, 0, dw, dh);
    ctx.save();
    if (flip) {
      ctx.scale(-1, 1);
      ctx.translate(-dw, 0);
    }
    const cols = Math.floor(img.naturalWidth / frameWidth);
    const col = cols > 0 ? frame % cols : frame;
    const row = cols > 0 ? Math.floor(frame / cols) : 0;
    ctx.drawImage(
      img,
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      0,
      0,
      dw,
      dh
    );
    ctx.restore();
  }, [frameWidth, frameHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayW = frameWidth * scale;
    const displayH = frameHeight * scale;
    canvas.width = displayW;
    canvas.height = displayH;
    ctx.imageSmoothingEnabled = false;

    frameRef.current = startFrame ?? 0;
    lastTimeRef.current = 0;
    stoppedRef.current = false;

    const initialFrame = startFrame ?? 0;
    const cachedImg = imageCache.get(spriteSheet);
    if (cachedImg) {
      drawFrame(ctx, cachedImg, initialFrame, displayW, displayH, flipX);
    }

    let currentImage: HTMLImageElement | null = cachedImg || null;
    if (!currentImage) {
      preloadImage(spriteSheet).then(img => {
        if (!stoppedRef.current) {
          currentImage = img;
          drawFrame(ctx, img, initialFrame, displayW, displayH, propsRef.current.flipX);
        }
      });
    }

    const render = (timestamp: number) => {
      if (stoppedRef.current) return;

      const { totalFrames: tf, fps: f, loop: l, flipX: fx, onComplete: oc, pauseAtFrame: paf } = propsRef.current;
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
        drawFrame(ctx, currentImage, currentFrame, displayW, displayH, fx);

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
  }, [spriteSheet, frameWidth, frameHeight, scale, drawFrame, flipX, startFrame]);

  const displayW = frameWidth * scale;
  const displayH = frameHeight * scale;

  return (
    <canvas
      ref={canvasRef}
      width={displayW}
      height={displayH}
      className={className}
      style={{
        width: displayW,
        height: displayH,
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
}
