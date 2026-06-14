// Animación del campo de malla 3D ("fishnet") del hero.
//
// Función pura, sin React: recibe el <canvas> y arranca la animación con
// requestAnimationFrame. Devuelve una función de limpieza que cancela el
// frame y quita el listener de resize (la invoca el componente al desmontar).
// Color de las líneas: celeste de marca (#54BCEB).

export function startHeroCanvas(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  if (!ctx || !container) return () => {};

  let width = 0;
  let height = 0;
  let time = 0;
  let frameId = 0;

  const resize = () => {
    width = canvas.width = container.offsetWidth;
    height = canvas.height = container.offsetHeight;
  };

  // Parámetros de la malla
  const spacing = 16;
  const totalLines = 95;
  const step = 12;
  const angle = Math.PI / 4; // 45°

  const field = (x: number, y: number) => {
    const wave1 = Math.sin(x * 0.004 + time * 0.42) * 75;
    const wave2 = Math.cos(x * 0.009 - time * 0.2) * 26;
    const wave3 = Math.sin((x + y) * 0.002 + time * 0.15) * 52;
    return wave1 + wave2 + wave3;
  };

  const animate = () => {
    // Rastro cinematográfico (esmeralda profundo translúcido)
    ctx.fillStyle = 'rgba(0, 52, 69, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(angle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawWidth = Math.max(width, height) * 2;

    for (let i = 0; i < totalLines; i++) {
      const depth = i / totalLines;
      const baseY = i * spacing - (totalLines * spacing) / 2;
      const alpha = 0.02 + depth * 0.18;
      const lineWidth = 0.2 + depth * 1.4;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(84, 188, 235, ${alpha})`;
      ctx.lineWidth = lineWidth;

      for (let x = -drawWidth; x < drawWidth; x += step) {
        const offset = field(x, baseY);
        const perspective = Math.sin(x * 0.0012 + time * 0.1) * (depth * 180);
        const y = baseY + offset + perspective;
        if (x === -drawWidth) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.restore();
    time += 0.018;
    frameId = requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resize);
  resize();
  animate();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resize);
  };
}
