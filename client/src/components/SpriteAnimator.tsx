import { useEffect, useRef, useCallback, memo } from "react";

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

function SpriteAnimatorInner({
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
  const currentSheetRef = useRef(spriteSheet);
  const canvasSizeRef = useRef({ w: 0, h: 0 });

  const propsRef = useRef({ spriteSheet, totalFrames, fps, loop, flipX, onComplete, pauseAtFrame, frameWidth, frameHeight });
  propsRef.current = { spriteSheet, totalFrames, fps, loop, flipX, onComplete, pauseAtFrame, frameWidth, frameHeight };

  useEffect(() => {
    if (preloadSheets) {
      preloadSheets.forEach(src => preloadImage(src));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayW = frameWidth * scale;
    const displayH = frameHeight * scale;

    if (canvasSizeRef.current.w !== displayW || canvasSizeRef.current.h !== displayH) {
      canvas.width = displayW;
      canvas.height = displayH;
      canvasSizeRef.current = { w: displayW, h: displayH };
    }
    ctx.imageSmoothingEnabled = false;

    const sheetChanged = currentSheetRef.current !== spriteSheet;
    currentSheetRef.current = spriteSheet;

    if (sheetChanged) {
      frameRef.current = startFrame ?? 0;
      lastTimeRef.current = 0;
    } else if (stoppedRef.current) {
      frameRef.current = startFrame ?? 0;
      lastTimeRef.current = 0;
    }
    stoppedRef.current = false;

    const initialFrame = frameRef.current;
    const cachedImg = imageCache.get(spriteSheet);
    if (cachedImg) {
      const { frameWidth: fw, frameHeight: fh, flipX: fx } = propsRef.current;
      const cols = Math.floor(cachedImg.naturalWidth / fw);
      const col = cols > 0 ? initialFrame % cols : initialFrame;
      const row = cols > 0 ? Math.floor(initialFrame / cols) : 0;
      ctx.clearRect(0, 0, displayW, displayH);
      ctx.save();
      if (fx) {
        ctx.scale(-1, 1);
        ctx.translate(-displayW, 0);
      }
      ctx.drawImage(cachedImg, col * fw, row * fh, fw, fh, 0, 0, displayW, displayH);
      ctx.restore();
    }

    let currentImage: HTMLImageElement | null = cachedImg || null;
    if (!currentImage) {
      preloadImage(spriteSheet).then(img => {
        if (!stoppedRef.current) {
          currentImage = img;
          const { frameWidth: fw, frameHeight: fh, flipX: fx } = propsRef.current;
          const cols = Math.floor(img.naturalWidth / fw);
          const col = cols > 0 ? initialFrame % cols : initialFrame;
          const row = cols > 0 ? Math.floor(initialFrame / cols) : 0;
          ctx.clearRect(0, 0, displayW, displayH);
          ctx.save();
          if (fx) {
            ctx.scale(-1, 1);
            ctx.translate(-displayW, 0);
          }
          ctx.drawImage(img, col * fw, row * fh, fw, fh, 0, 0, displayW, displayH);
          ctx.restore();
        }
      });
    }

    const render = (timestamp: number) => {
      if (stoppedRef.current) return;

      const { totalFrames: tf, fps: f, loop: l, flipX: fx, onComplete: oc, pauseAtFrame: paf, frameWidth: fw, frameHeight: fh } = propsRef.current;
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
        const cols = Math.floor(currentImage.naturalWidth / fw);
        const col = cols > 0 ? currentFrame % cols : currentFrame;
        const row = cols > 0 ? Math.floor(currentFrame / cols) : 0;

        ctx.clearRect(0, 0, displayW, displayH);
        ctx.save();
        if (fx) {
          ctx.scale(-1, 1);
          ctx.translate(-displayW, 0);
        }
        ctx.drawImage(currentImage, col * fw, row * fh, fw, fh, 0, 0, displayW, displayH);
        ctx.restore();

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
  }, [spriteSheet, scale, startFrame]);

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

const SpriteAnimator = memo(SpriteAnimatorInner);
export default SpriteAnimator;
