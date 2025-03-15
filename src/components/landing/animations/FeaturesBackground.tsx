import React, { useEffect, useRef } from "react";

interface Gear {
  x: number;
  y: number;
  radius: number;
  teeth: number;
  rotation: number;
  speed: number;
  direction: number;
}

const FeaturesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gearsRef = useRef<Gear[]>([]);
  const animationFrameRef = useRef<number>(0);

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
      const gearCount = Math.floor((canvas.width * canvas.height) / 90000);
      gearsRef.current = [];

      for (let i = 0; i < gearCount; i++) {
        gearsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 30 + 20,
          teeth: Math.floor(Math.random() * 8) + 8,
          rotation: Math.random() * Math.PI * 2,
          speed: (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? 1 : -1),
          direction: Math.random() < 0.5 ? 1 : -1,
        });
      }
    };

    const drawGear = (gear: Gear) => {
      const { x, y, radius, teeth, rotation } = gear;
      const toothHeight = radius * 0.2;
      const toothAngle = (Math.PI * 2) / teeth;

      ctx.beginPath();
      ctx.moveTo(
        x + radius * Math.cos(rotation),
        y + radius * Math.sin(rotation),
      );

      for (let i = 0; i < teeth; i++) {
        const angle = rotation + i * toothAngle;
        const nextAngle = angle + toothAngle / 2;
        const outerAngle = angle + toothAngle;

        // Draw tooth outer edge
        ctx.lineTo(
          x + (radius + toothHeight) * Math.cos(angle),
          y + (radius + toothHeight) * Math.sin(angle),
        );
        ctx.lineTo(
          x + (radius + toothHeight) * Math.cos(nextAngle),
          y + (radius + toothHeight) * Math.sin(nextAngle),
        );
        ctx.lineTo(
          x + radius * Math.cos(outerAngle),
          y + radius * Math.sin(outerAngle),
        );
      }

      ctx.closePath();
      ctx.fillStyle = "rgba(229, 231, 235, 0.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(229, 231, 235, 0.2)";
      ctx.stroke();

      // Draw center circle
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(229, 231, 235, 0.2)";
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      gearsRef.current.forEach((gear) => {
        gear.rotation += gear.speed;
        drawGear(gear);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full opacity-50"
      style={{ pointerEvents: "none" }}
    />
  );
};

export default FeaturesBackground;
