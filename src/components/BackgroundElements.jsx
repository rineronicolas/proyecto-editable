import { useEffect, useRef } from 'react';

export default function ParticulasCaterpillar() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const elements = Array.from({ length: 450 }, () => ({
      type: Math.random() > 0.5 ? 'circle' : 'line',
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.3, // Muy pequeñas: 0.3 a 1.8px
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: 1, // Nitidez total
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ajuste de nitidez
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';

      elements.forEach(e => {
        e.x += e.speedX;
        e.y += e.speedY;

        if (e.x < 0) e.x = window.innerWidth;
        if (e.x > window.innerWidth) e.x = 0;
        if (e.y < 0) e.y = window.innerHeight;
        if (e.y > window.innerHeight) e.y = 0;

        ctx.beginPath();
        if (e.type === 'circle') {
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.lineWidth = 0.5;
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(e.x + 3, e.y + 3);
          ctx.stroke();
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} 
    />
  );
}