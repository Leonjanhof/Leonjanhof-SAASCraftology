import React, { useEffect, useRef, useState, memo } from "react";

interface Gear {
  x: number;
  y: number;
  radius: number;
  teeth: number;
  rotation: number;
  speed: number;
  color: string;
  originalColor: string;
  originalSpeed: number;
  isHovered: boolean;
}

const GearsBackground: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gearsRef = useRef<Gear[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState<string>("default");
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initGears();
    };

    const initGears = () => {
      gearsRef.current = [];

      const gearCount = Math.max(
        5,
        Math.floor((canvas.width * canvas.height) / 150000), // Reduced gear count for better performance
      );

      const colors = [
        "rgba(229, 231, 235, 0.3)",
        "rgba(209, 213, 219, 0.3)",
        "rgba(156, 163, 175, 0.3)",
        "rgba(74, 222, 128, 0.2)",
        "rgba(34, 197, 94, 0.2)",
      ];

      for (let i = 0; i < gearCount; i++) {
        const radius = Math.random() * 50 + 30;
        const teeth = Math.floor(radius / 5);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speed =
          (Math.random() * 0.002 + 0.0005) * (Math.random() > 0.5 ? 1 : -1);

        gearsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          teeth,
          rotation: Math.random() * Math.PI * 2,
          speed,
          color,
          originalColor: color,
          originalSpeed: speed,
          isHovered: false,
        });
      }
    };

    const drawGear = (ctx: CanvasRenderingContext2D, gear: Gear) => {
      const { x, y, radius, teeth, rotation, color } = gear;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const innerRadius = radius * 0.7;
      const toothDepth = radius - innerRadius;
      const angleStep = (Math.PI * 2) / teeth;

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      // Draw teeth
      for (let i = 0; i < teeth; i++) {
        const angle = i * angleStep;
        const outerX = Math.cos(angle) * radius;
        const outerY = Math.sin(angle) * radius;
        const innerAngle1 = angle - angleStep * 0.25;
        const innerAngle2 = angle + angleStep * 0.25;
        const innerX1 = Math.cos(innerAngle1) * innerRadius;
        const innerY1 = Math.sin(innerAngle1) * innerRadius;
        const innerX2 = Math.cos(innerAngle2) * innerRadius;
        const innerY2 = Math.sin(innerAngle2) * innerRadius;

        if (i === 0) ctx.moveTo(innerX1, innerY1);
        ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX2, innerY2);
      }

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw center hole
      ctx.beginPath();
      ctx.fillStyle = gear.isHovered
        ? "rgba(74, 222, 128, 0.8)"
        : "rgba(255, 255, 255, 0.8)";
      ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const checkGearHover = (mouseX: number, mouseY: number) => {
      if (isScrollingRef.current) return;

      let isOverAnyGear = false;

      for (let i = gearsRef.current.length - 1; i >= 0; i--) {
        const gear = gearsRef.current[i];
        const dx = mouseX - gear.x;
        const dy = mouseY - gear.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const isHovered = distance <= gear.radius;

        if (isHovered !== gear.isHovered) {
          gear.isHovered = isHovered;
          if (isHovered) {
            gear.color = "rgba(74, 222, 128, 0.4)";
            gear.speed = gear.originalSpeed * 3;
            isOverAnyGear = true;
          } else {
            gear.color = gear.originalColor;
            gear.speed = gear.originalSpeed;
          }
        }

        if (isHovered) {
          isOverAnyGear = true;
          break;
        }
      }

      setCursorStyle(isOverAnyGear ? "pointer" : "default");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isScrollingRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      mousePositionRef.current = { x: mouseX, y: mouseY };
      checkGearHover(mouseX, mouseY);
    };

    const handleScroll = () => {
      isScrollingRef.current = true;

      // Clear any existing timeout
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      // Set a timeout to stop considering scrolling after 150ms of no scroll events
      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
        scrollTimeoutRef.current = null;
      }, 150);
    };

    // Use Intersection Observer to detect when the canvas is visible
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0.1 },
    );

    observer.observe(canvas);

    let lastTime = performance.now();
    let lastAnimationTime = 0;
    const targetFPS = 30; // Lower FPS for better performance
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      const elapsed = currentTime - lastAnimationTime;

      // Only render if enough time has passed (frame limiting) and not scrolling
      if (elapsed >= frameInterval && isVisibleRef.current) {
        lastTime = currentTime;
        lastAnimationTime = currentTime;

        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        gearsRef.current.forEach((gear) => {
          gear.rotation += gear.speed * (deltaTime / 16.67); // Normalize to 60fps
          drawGear(ctx, gear);
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    resizeCanvas();
    animate(performance.now());

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-gray-50"
      style={{
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "none",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          cursor: cursorStyle,
          touchAction: "none",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
});

GearsBackground.displayName = "GearsBackground";

export default GearsBackground;
