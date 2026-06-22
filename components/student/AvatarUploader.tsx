'use client';

// Editor de foto de perfil del estudiante: subir desde galería/archivo,
// ajustar al círculo (zoom + arrastrar) y guardar, o eliminar la foto actual.
// Devuelve un data URL recortado (256×256) que se guarda en la fuente única
// (y de ahí a Supabase), vinculado a la persona.

import React, { useRef, useState } from 'react';

const S = 256; // tamaño del recorte (px)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function AvatarUploader({
  abierto,
  fotoActual,
  onGuardar,
  onCerrar,
}: {
  abierto: boolean;
  fotoActual?: string;
  onGuardar: (dataUrl: string) => void;
  onCerrar: () => void;
}) {
  const [src, setSrc] = useState('');
  const [base, setBase] = useState({ w: S, h: S });
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  if (!abierto) return null;

  const dispW = base.w * zoom;
  const dispH = base.h * zoom;
  const clampOff = (x: number, y: number) => ({
    x: clamp(x, S - dispW, 0),
    y: clamp(y, S - dispH, 0),
  });

  const cargarImagen = (fuente: string, crossOrigin = false) => {
    setError('');
    const im = new Image();
    if (crossOrigin) im.crossOrigin = 'anonymous';
    im.onload = () => {
      const escala = Math.max(S / im.naturalWidth, S / im.naturalHeight);
      const w = im.naturalWidth * escala;
      const h = im.naturalHeight * escala;
      imgRef.current = im;
      setBase({ w, h });
      setZoom(1);
      setOff({ x: (S - w) / 2, y: (S - h) / 2 });
      setSrc(fuente);
    };
    im.onerror = () => setError('No se pudo cargar la imagen. Probá con un archivo o con otra URL.');
    im.src = fuente;
  };

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cargarImagen(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onCambiarZoom = (z: number) => {
    setZoom(z);
    setOff((o) => {
      const dw = base.w * z;
      const dh = base.h * z;
      return { x: clamp(o.x, S - dw, 0), y: clamp(o.y, S - dh, 0) };
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!src) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const nx = drag.current.ox + (e.clientX - drag.current.x);
    const ny = drag.current.oy + (e.clientY - drag.current.y);
    setOff(clampOff(nx, ny));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const guardar = () => {
    const im = imgRef.current;
    if (!im || !src) return;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, S, S);
    ctx.drawImage(im, off.x, off.y, dispW, dispH);
    try {
      onGuardar(canvas.toDataURL('image/jpeg', 0.85));
    } catch {
      // Imagen externa sin CORS: se guarda la URL tal cual (se ajusta con object-cover).
      onGuardar(src);
    }
    onCerrar();
  };

  const eliminar = () => {
    onGuardar('');
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline-md text-lg text-primary">Foto de perfil</h3>
          <button type="button" onClick={onCerrar} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Vista de recorte circular */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative overflow-hidden rounded-full border-4 border-primary bg-surface-container-high"
            style={{ width: S, height: S, touchAction: 'none', cursor: src ? 'grab' : 'default' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {src ? (
              <img
                src={src}
                alt="Vista previa"
                draggable={false}
                style={{ position: 'absolute', left: off.x, top: off.y, width: dispW, height: dispH, maxWidth: 'none' }}
              />
            ) : fotoActual ? (
              <img src={fotoActual} alt="Foto actual" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl">add_a_photo</span>
              </div>
            )}
          </div>

          {src && (
            <div className="flex w-full items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">zoom_out</span>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => onCambiarZoom(Number(e.target.value))} className="flex-1 accent-secondary" />
              <span className="material-symbols-outlined text-on-surface-variant">zoom_in</span>
            </div>
          )}
          <p className="text-xs text-on-surface-variant">{src ? 'Arrastrá para reposicionar · deslizá para hacer zoom' : 'Subí una foto desde tu galería o archivo'}</p>
        </div>

        {/* Fuente */}
        <div className="mt-4 space-y-3">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-on-secondary">
            <span className="material-symbols-outlined text-base">upload</span> Subir desde galería / archivo
            <input type="file" accept="image/*" className="hidden" onChange={onArchivo} />
          </label>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center justify-between gap-2">
          {fotoActual && !src && (
            <button type="button" onClick={eliminar} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-error hover:bg-error/10">
              <span className="material-symbols-outlined text-base">delete</span> Eliminar foto
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onCerrar} className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant">Cancelar</button>
            <button type="button" onClick={guardar} disabled={!src} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-40">
              <span className="material-symbols-outlined text-base">check</span> Guardar foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
