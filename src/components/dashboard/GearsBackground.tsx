import React, { useEffect, useRef, useState } from "react";

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

const GearsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gearsRef = useRef<Gear[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState<string>("default");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGears();
    };

    const initGears = () => {
      // Clear existing gears
      gearsRef.current = [];

      // Create a variety of gears across the canvas
      const gearCount = Math.max(
        5,
        Math.floor((canvas.width * canvas.height) / 100000),
      );

      // Colors that match the theme
      const colors = [
        "rgba(229, 231, 235, 0.3)", // Light gray
        "rgba(209, 213, 219, 0.3)", // Medium gray
        "rgba(156, 163, 175, 0.3)", // Dark gray
        "rgba(74, 222, 128, 0.2)", // Light green
        "rgba(34, 197, 94, 0.2)", // Medium green
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

      // Draw gear body
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      // Inner circle
      const innerRadius = radius * 0.7;
      ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw teeth
      const toothDepth = radius - innerRadius;
      const angleStep = (Math.PI * 2) / teeth;

      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const angle = i * angleStep;

        // Outer point of tooth
        const outerX = Math.cos(angle) * radius;
        const outerY = Math.sin(angle) * radius;

        // Inner points of tooth (sides)
        const innerAngle1 = angle - angleStep * 0.25;
        const innerAngle2 = angle + angleStep * 0.25;
        const innerX1 = Math.cos(innerAngle1) * innerRadius;
        const innerY1 = Math.sin(innerAngle1) * innerRadius;
        const innerX2 = Math.cos(innerAngle2) * innerRadius;
        const innerY2 = Math.sin(innerAngle2) * innerRadius;

        if (i === 0) {
          ctx.moveTo(innerX1, innerY1);
        }

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

    // Check if mouse is over a gear
    const checkGearHover = (mouseX: number, mouseY: number) => {
      let isOverAnyGear = false;

      // Check each gear in reverse order (to handle overlapping gears properly)
      for (let i = gearsRef.current.length - 1; i >= 0; i--) {
        const gear = gearsRef.current[i];
        const dx = mouseX - gear.x;
        const dy = mouseY - gear.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if mouse is within the gear's radius
        const isHovered = distance <= gear.radius;

        // Only update if hover state has changed
        if (isHovered !== gear.isHovered) {
          gear.isHovered = isHovered;

          if (isHovered) {
            // Enhance the hovered gear
            gear.color = "rgba(74, 222, 128, 0.4)"; // Brighter green
            gear.speed = gear.originalSpeed * 3; // Speed up
            isOverAnyGear = true;
          } else {
            // Reset to original state
            gear.color = gear.originalColor;
            gear.speed = gear.originalSpeed;
          }
        }

        if (isHovered) {
          isOverAnyGear = true;
          break; // Only interact with the topmost gear
        }
      }

      // Update cursor style
      setCursorStyle(isOverAnyGear ? "pointer" : "default");
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      mousePositionRef.current = { x: mouseX, y: mouseY };
      checkGearHover(mouseX, mouseY);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      gearsRef.current.forEach((gear) => {
        // Update rotation
        gear.rotation += gear.speed;

        // Draw the gear
        drawGear(ctx, gear);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Add event listeners
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-gray-50"
      style={{ cursor: cursorStyle }}
    />
  );
};

export default GearsBackground;
