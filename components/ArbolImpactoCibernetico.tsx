'use client';

import React, { useState } from 'react';

interface ArbolImpactoCiberneticoProps {
  legado: any;
  nombre: string;
  facultad: string;
  anio: string | number;
}

interface NodeData {
  id: string;
  label: string;
  sublabel?: string;
  level: number;
  x: number;
  y: number;
  type: 'mentor' | 'core' | 'student' | 'grandchild';
  raw?: any;
}

interface EdgeData {
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  animated: boolean;
  colorClass: string;
}

const FALLBACK_RAMAS = [
  {
    id: "test-valeria",
    nombre: "Valeria Mora Castro",
    correo: "valeria.mora@ucr.ac.cr",
    estadoMatch: "cerrado",
    resultadoMatch: "exitoso",
    tipoApoyo: "Mentoría de TFG",
    scoreMatch: 98,
    proyecto: "Sistema IoT de Monitoreo Hídrico de Precisión para Zonas Agrícolas de Costa Rica",
    totalDonado: 150000,
    fechaInicio: "2025-04-10T12:00:00Z",
    fechaFin: "2025-11-20T12:00:00Z",
    tipoSemilla: "Semilla de Desarrollo Sostenible",
    icono: "forest",
    metafora: "Esta semilla promueve el equilibrio ecológico, la eficiencia de recursos y el bienestar de las comunidades.",
    resena: "Gracias a su orientación logré vincular mi propuesta teórica con las necesidades de sostenibilidad reales de la industria costarricense.",
    tesisStatus: "Tesis Laureada (100/100)",
    horasMentoria: 30,
    calificacion: 5,
    hijos: ["Felipe Rojas", "Sofía Delgado"],
    esMentorActivo: true
  },
  {
    id: "test-ignacio",
    nombre: "Ignacio Herrera Ortiz",
    correo: "ignacio.herrera@ucr.ac.cr",
    estadoMatch: "cerrado",
    resultadoMatch: "exitoso",
    tipoApoyo: "Aporte Financiero Directo",
    scoreMatch: 95,
    proyecto: "Desarrollo de Prótesis Activas Impresas en 3D para Niños en Rehabilitación",
    totalDonado: 250000,
    fechaInicio: "2025-06-01T10:00:00Z",
    fechaFin: "2025-12-15T10:00:00Z",
    tipoSemilla: "Semilla de Apoyo Económico Sostenible",
    icono: "volunteer_activism",
    metafora: "Esta semilla representa el soporte material directo que viabiliza el desarrollo técnico y científico de los estudiantes de la red.",
    resena: "El financiamiento brindado por don Roberto fue crucial para adquirir los servomotores y filamentos avanzados de la prótesis. ¡Un impacto directo en la vida de 10 niños!",
    tesisStatus: "Tesis Finalizada (Mención de Honor)",
    horasMentoria: 0,
    calificacion: 5,
    hijos: [],
    esMentorActivo: false
  },
  {
    id: "test-esteban",
    nombre: "Esteban Quirós Solano",
    correo: "esteban.quiros@ucr.ac.cr",
    estadoMatch: "activo",
    resultadoMatch: null,
    tipoApoyo: "Mentoría Técnica",
    scoreMatch: 94,
    proyecto: "Optimización de Algoritmos Criptográficos Ligeros para Dispositivos Médicos Conectados",
    totalDonado: 0,
    fechaInicio: "2026-02-15T09:00:00Z",
    fechaFin: null,
    tipoSemilla: "Semilla de Innovación Tecnológica",
    icono: "rocket_launch",
    metafora: "Esta semilla representa el impulso de nuevas fronteras tecnológicas y arquitecturas de software eficientes.",
    resena: "Su guía técnica fue el pilar fundamental para resolver la arquitectura de microservicios de mi proyecto. ¡Eternamente agradecido por su dedicación y paciencia!",
    tesisStatus: "Tesis en Curso (Desarrollo)",
    horasMentoria: 24,
    calificacion: 4,
    hijos: [],
    esMentorActivo: false
  },
  {
    id: "test-mariela",
    nombre: "Mariela Castro Vega",
    correo: "mariela.castro@ucr.ac.cr",
    estadoMatch: "cerrado",
    resultadoMatch: "exitoso",
    tipoApoyo: "Apoyo Económico & Co-Creación",
    scoreMatch: 96,
    proyecto: "Diseño Adaptativo de un Sistema de Aprendizaje Inclusivo para Niños con TDAH",
    totalDonado: 100000,
    fechaInicio: "2025-05-18T14:00:00Z",
    fechaFin: "2025-12-10T14:00:00Z",
    tipoSemilla: "Semilla de Compromiso Social y Educación",
    icono: "local_library",
    metafora: "Esta semilla florece al compartir conocimiento, impulsando la igualdad de oportunidades y la educación inclusiva.",
    resena: "Su mentoría fue clave para poder plantear un diseño accesible que toma en cuenta a personas con discapacidad en nuestro sistema educativo.",
    tesisStatus: "Tesis Aprobada con Distinción",
    horasMentoria: 22,
    calificacion: 5,
    hijos: ["David Alfaro"],
    esMentorActivo: true
  }
];

const FALLBACK_MENTOR = {
  nombre: "Dra. Ana María Trejos",
  correo: "ana.trejos@ucr.ac.cr"
};

export default function ArbolImpactoCibernetico({ legado, nombre, facultad, anio }: ArbolImpactoCiberneticoProps) {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Usar datos reales si existen ramas; de lo contrario, usar el fallback de demostración
  const tieneDatosReales = legado?.arbolImpacto?.ramas && legado.arbolImpacto.ramas.length > 0;
  
  const mentorRaiz = tieneDatosReales ? legado?.arbolImpacto?.mentorRaiz : FALLBACK_MENTOR;
  const ramas = tieneDatosReales ? legado?.arbolImpacto?.ramas : FALLBACK_RAMAS;

  // Calcular estadísticas del árbol (utilizando resumen del backend si está disponible)
  const totalRamas = legado?.resumen ? legado.resumen.totalSemillas : ramas.length;
  const totalNietos = ramas.reduce((acc: number, r: any) => acc + (r.hijos?.length || 0), 0);
  const totalNodos = 1 + (mentorRaiz ? 1 : 0) + ramas.length + totalNietos;
  const totalDonadoRed = legado?.resumen ? legado.resumen.totalDonado : ramas.reduce((acc: number, r: any) => acc + (r.totalDonado || 0), 0);
  const totalHorasMentoria = legado?.resumen ? legado.resumen.totalHoras : ramas.reduce((acc: number, r: any) => acc + (r.horasMentoria || 0), 0);

  // Generar posiciones físicas en el canvas SVG (width=800, height=530)
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];

  // 1. Nodo Ancestral (Mentor Origen)
  if (mentorRaiz) {
    nodes.push({
      id: 'mentor-raiz',
      label: mentorRaiz.nombre,
      sublabel: 'Mentor Ancestral',
      level: 0,
      x: 400,
      y: 50,
      type: 'mentor',
      raw: mentorRaiz
    });
  }

  // 2. Nodo Central (Exalumno - Tú)
  const coreNodeId = 'core-exalumno';
  nodes.push({
    id: coreNodeId,
    label: nombre || 'Tú',
    sublabel: `${facultad || ''} · Clase ${anio || ''}`,
    level: 1,
    x: 400,
    y: 160,
    type: 'core'
  });

  if (mentorRaiz) {
    edges.push({
      fromId: 'mentor-raiz',
      toId: coreNodeId,
      x1: 400,
      y1: 50,
      x2: 400,
      y2: 160,
      animated: true,
      colorClass: 'stroke-[#D97706]/75' // Ámbar
    });
  }

  // 3. Nodos Estudiante (Ramas directas)
  ramas.forEach((branch: any, i: number) => {
    let rx = 400;
    if (totalRamas > 1) {
      const padding = 100;
      const widthAvailable = 800 - padding * 2;
      rx = padding + (i * widthAvailable) / (totalRamas - 1);
    }
    const ry = 310;
    const branchId = `branch-${branch.id || i}`;

    nodes.push({
      id: branchId,
      label: branch.nombre,
      sublabel: branch.estadoMatch === 'cerrado' ? 'Egresado' : 'Estudiante',
      level: 2,
      x: rx,
      y: ry,
      type: 'student',
      raw: branch
    });

    const isEgresado = branch.estadoMatch === 'cerrado';
    const esDonacionExclusiva = branch.horasMentoria === 0;
    let edgeColor = 'stroke-[#00A7C1]/75'; // Celeste UCR

    if (esDonacionExclusiva) {
      edgeColor = 'stroke-[#FF9F1C]/75'; // Dorado
    } else if (isEgresado) {
      edgeColor = 'stroke-[#10B981]/75'; // Verde
    }

    edges.push({
      fromId: coreNodeId,
      toId: branchId,
      x1: 400,
      y1: 160,
      x2: rx,
      y2: ry,
      animated: true,
      colorClass: edgeColor
    });

    // 4. Nodos Nietos (Efecto multiplicador)
    const hijos = branch.hijos || [];
    const numHijos = hijos.length;

    hijos.forEach((hijoName: string, j: number) => {
      let hx = rx;
      if (numHijos > 1) {
        const spread = 100;
        hx = rx - spread / 2 + (j * spread) / (numHijos - 1);
      }
      const hy = 455;
      const hijoId = `hijo-${branchId}-${j}`;

      nodes.push({
        id: hijoId,
        label: hijoName,
        sublabel: 'Mentoría Indirecta',
        level: 3,
        x: hx,
        y: hy,
        type: 'grandchild'
      });

      edges.push({
        fromId: branchId,
        toId: hijoId,
        x1: rx,
        y1: ry,
        x2: hx,
        y2: hy,
        animated: true,
        colorClass: 'stroke-[#8B5CF6]/70'
      });
    });
  });

  const renderStars = (rating: number = 5) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`material-symbols-outlined text-[19px] select-none ${
            i <= rating ? 'text-[#FFB800] fill-current drop-shadow-[0_0_3px_rgba(255,184,0,0.4)]' : 'text-slate-300'
          }`}
          style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      );
    }
    return <div className="flex gap-0.5 items-center">{stars}</div>;
  };

  return (
    <div className="relative w-full h-full text-slate-800 font-brand-body flex flex-col justify-between bg-gradient-to-br from-[#FAFCFD] to-[#F3F7F8] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-[fadeIn_0.5s_ease-out]">
      <style>{`
        @keyframes pulse-halo-light {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.15); opacity: 0.28; }
        }
        @keyframes pulse-aurora-light {
          0%, 100% { opacity: 0.04; transform: translate(0px, 0px) scale(1); }
          50% { opacity: 0.08; transform: translate(15px, -15px) scale(1.05); }
        }
        @keyframes rotate-dashed {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-pulse-halo-light {
          animation: pulse-halo-light 3s ease-in-out infinite;
        }
        .animate-rotate-dashed {
          animation: rotate-dashed 12s linear infinite;
        }
        .brand-grid-lines-thick {
          background-image: linear-gradient(to right, rgba(0, 91, 112, 0.035) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 91, 112, 0.035) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      {/* Auroras de fondo de marca */}
      <div className="absolute inset-0 brand-grid-lines-thick pointer-events-none" />
      <div 
        className="absolute -top-[20%] left-1/4 h-[90%] w-[50%] rounded-full bg-[#005B70]/10 blur-[130px] pointer-events-none" 
        style={{ animation: 'pulse-aurora-light 10s ease-in-out infinite' }}
      />
      <div 
        className="absolute -bottom-[20%] right-1/4 h-[80%] w-[45%] rounded-full bg-[#00A7C1]/10 blur-[120px] pointer-events-none" 
        style={{ animation: 'pulse-aurora-light 12s ease-in-out infinite' }}
      />
      <div 
        className="absolute top-1/3 left-1/3 h-[50%] w-[35%] rounded-full bg-[#FFB800]/5 blur-[100px] pointer-events-none" 
      />

      {/* Cabecera del Portal */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#005B70]/15 pb-4 mb-6">
        <div>
          <span className="text-[12px] font-mono tracking-widest text-[#005B70] uppercase font-black block mb-1">
            Visualizador Académico de Impacto {!tieneDatosReales && " (Modo Demo)"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#004857] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005B70] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>forest</span> Red de Semillas del Legado
          </h2>
          <p className="text-sm text-slate-600 font-light mt-1.5 max-w-2xl leading-relaxed">
            Explora las semillas de conocimiento sembradas por exalumnos mentores en la red de estudiantes. Selecciona un nodo para desplegar su expediente de TFG y reseñas de éxito.
          </p>
        </div>
      </div>

      {/* Estadísticas de Cabecera */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 font-brand-body">
        <div className="bg-white/80 border border-slate-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.015)] backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#005B70]/10 flex items-center justify-center text-[#005B70]">
            <span className="material-symbols-outlined text-xl">group</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider block">Estudiantes Guiados</span>
            <span className="font-bold text-[#004857] text-base">{totalRamas} Semillas</span>
          </div>
        </div>

        <div className="bg-white/80 border border-slate-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.015)] backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <span className="material-symbols-outlined text-xl">volunteer_activism</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider block">Donaciones Confirmadas</span>
            <span className="font-bold text-emerald-600 text-base">
              {totalDonadoRed > 0 ? `₡${totalDonadoRed.toLocaleString('es-CR')} ✓` : '₡0'}
            </span>
          </div>
        </div>

        <div className="bg-white/80 border border-slate-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.015)] backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-[#00A7C1] border border-cyan-100">
            <span className="material-symbols-outlined text-xl">hourglass_empty</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider block">Horas de Mentoría</span>
            <span className="font-bold text-[#00A7C1] text-base">{totalHorasMentoria} Horas</span>
          </div>
        </div>

        <div className="bg-white/80 border border-slate-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.015)] backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
            <span className="material-symbols-outlined text-xl">hub</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10.5px] uppercase font-bold tracking-wider block">Polinización Multiplicadora</span>
            <span className="font-bold text-purple-600 text-base">+{totalNietos} Nietos</span>
          </div>
        </div>
      </div>

      {/* Main Grid de Diagrama y Ficha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-1 min-h-0">
        
        {/* Lado Izquierdo: SVG Canvas del Árbol */}
        <div className="lg:col-span-8 bg-white/70 border border-slate-200 rounded-2xl p-3 relative overflow-hidden flex items-center justify-center shadow-sm backdrop-blur-md min-h-[460px] lg:min-h-0 h-full">
          <svg
            viewBox="0 0 800 530"
            className="w-full h-auto select-none max-h-full"
            style={{ filter: 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.015))' }}
          >
            <defs>
              <filter id="light-glow-strong" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Renderizar Edges */}
            {edges.map((edge, idx) => {
              const midY = (edge.y1 + edge.y2) / 2;
              const pathData = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={pathData}
                    fill="none"
                    className={edge.colorClass}
                    strokeWidth="5"
                    opacity="0.15"
                    style={{ filter: 'url(#light-glow-strong)' }}
                  />
                  <path
                    d={pathData}
                    fill="none"
                    className={edge.colorClass}
                    strokeWidth="1.6"
                    opacity="0.8"
                  />
                  {edge.animated && (
                    <circle r="3" className="fill-[#005B70] shadow-sm">
                      <animateMotion
                        path={pathData}
                        dur={`${2.2 + (idx % 2)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Renderizar Nodos */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              
              let strokeColor = 'stroke-[#00A7C1]';
              let fillColor = 'fill-white';
              let size = 32;
              let icon = 'eco';
              let haloColor = 'stroke-[#00A7C1]/20';

              if (node.type === 'mentor') {
                strokeColor = 'stroke-[#FFB800]';
                icon = 'school';
                haloColor = 'stroke-[#FFB800]/25';
              } else if (node.type === 'core') {
                strokeColor = 'stroke-[#005B70]';
                fillColor = 'fill-[#005B70]';
                size = 38;
                icon = 'forest';
                haloColor = 'stroke-[#005B70]/20';
              } else if (node.type === 'student') {
                const isEgresado = node.raw?.estadoMatch === 'cerrado';
                const esDonacionExclusiva = node.raw?.horasMentoria === 0;
                
                if (esDonacionExclusiva) {
                  strokeColor = 'stroke-[#FF9F1C]';
                  haloColor = 'stroke-[#FF9F1C]/35';
                } else {
                  strokeColor = isEgresado ? 'stroke-[#10B981]' : 'stroke-[#00A7C1]';
                  haloColor = isEgresado ? 'stroke-[#10B981]/25' : 'stroke-[#00A7C1]/25';
                }
                
                icon = node.raw?.icono || (isEgresado ? 'workspace_premium' : 'local_library');
              } else if (node.type === 'grandchild') {
                strokeColor = 'stroke-[#8B5CF6]';
                fillColor = 'fill-white';
                size = 16;
                icon = 'eco';
                haloColor = 'stroke-[#8B5CF6]/20';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onClick={() => node.raw ? setSelectedNode(node) : setSelectedNode(null)}
                >
                  <circle
                    r={size + 8}
                    fill="none"
                    className={`animate-pulse-halo-light ${haloColor}`}
                    strokeWidth="1.5"
                  />

                  {isSelected && (
                    <circle
                      r={size + 12}
                      fill="none"
                      className="stroke-[#005B70]/40 stroke-[1.5px] animate-rotate-dashed"
                      strokeDasharray="4 4"
                      style={{ transformOrigin: 'center' }}
                    />
                  )}

                  <circle
                    r={size}
                    className={`${fillColor} ${strokeColor} transition-all duration-300 ${
                      isSelected ? 'stroke-[2.5px] scale-110 shadow-md' : 'stroke-[1.2px] hover:stroke-[#005B70] hover:scale-105'
                    }`}
                    style={{ filter: isSelected ? 'url(#light-glow-strong)' : '' }}
                  />

                  {node.type !== 'grandchild' ? (
                    <text
                      textAnchor="middle"
                      dy="5"
                      className={`pointer-events-none select-none font-bold ${
                        node.type === 'core' ? 'fill-white' : 'fill-[#005B70]'
                      }`}
                      style={{ fontFamily: 'Material Symbols Outlined', fontSize: `${size * 0.72}px` }}
                    >
                      {icon}
                    </text>
                  ) : (
                    <circle r="3" className="fill-[#8B5CF6]" />
                  )}

                  <text
                    textAnchor="middle"
                    y={size + 18}
                    className="fill-slate-800 font-extrabold text-[12.5px] pointer-events-none select-none"
                  >
                    {node.label}
                  </text>
                  {node.type === 'student' && node.raw ? (
                    (() => {
                      const isClosed = node.raw.estadoMatch === 'cerrado';
                      const statusText = isClosed ? 'Tesis Finalizada' : 'Tesis en Curso';
                      
                      let supportText = node.raw.tipoApoyo || '';
                      if (supportText === 'Aporte Financiero Directo') supportText = 'Donación Directa';
                      if (supportText === 'Apoyo Económico & Co-Creación') supportText = 'Donación y Co-Creación';
                      
                      const isDonacion = node.raw.horasMentoria === 0 || supportText.toLowerCase().includes('donación') || supportText.toLowerCase().includes('aporte');
                      const supportColors = isDonacion
                        ? { bg: "fill-amber-50/90", stroke: "stroke-amber-200/80", text: "fill-amber-700" }
                        : { bg: "fill-purple-50/90", stroke: "stroke-purple-200/80", text: "fill-purple-700" };
                        
                      const statusColors = isClosed
                        ? { bg: "fill-emerald-50/90", stroke: "stroke-emerald-200/80", text: "fill-emerald-700" }
                        : { bg: "fill-sky-50/90", stroke: "stroke-sky-200/80", text: "fill-sky-700" };

                      return (
                        <g transform={`translate(0, ${size + 24})`}>
                          {/* Pill 1: Estatus Tesis */}
                          <g transform="translate(-70, 0)">
                            <rect
                              x="0"
                              y="0"
                              width="140"
                              height="18"
                              rx="9"
                              className={`${statusColors.bg} ${statusColors.stroke} stroke-[1px]`}
                            />
                            <text
                              x="70"
                              y="12"
                              textAnchor="middle"
                              className={`${statusColors.text} text-[9.5px] font-extrabold pointer-events-none select-none`}
                            >
                              {statusText}
                            </text>
                          </g>
                          
                          {/* Pill 2: Tipo de Apoyo */}
                          <g transform="translate(-70, 22)">
                            <rect
                              x="0"
                              y="0"
                              width="140"
                              height="18"
                              rx="9"
                              className={`${supportColors.bg} ${supportColors.stroke} stroke-[1px]`}
                            />
                            <text
                              x="70"
                              y="12"
                              textAnchor="middle"
                              className={`${supportColors.text} text-[9.5px] font-extrabold pointer-events-none select-none`}
                            >
                              {supportText}
                            </text>
                          </g>
                        </g>
                      );
                    })()
                  ) : (
                    <text
                      textAnchor="middle"
                      y={size + 31}
                      className="fill-[#005B70]/80 text-[10.5px] pointer-events-none select-none font-bold"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-3.5 left-3.5 bg-slate-50/90 border border-slate-200/85 px-3.5 py-2 rounded-xl text-[12px] font-mono text-slate-500 flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm text-[#005B70] animate-bounce">touch_app</span>
            <span>Haz clic en un nodo de estudiante para activar su expediente.</span>
          </div>

          <div className="absolute bottom-3.5 right-3.5 bg-white/90 border border-slate-200/85 px-3.5 py-2.5 rounded-xl text-[10.5px] font-mono text-slate-500 flex flex-col gap-1.5 shadow-sm backdrop-blur-sm">
            <span className="font-bold text-[#004857] text-[11px] mb-0.5">Leyenda del Legado:</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300"></span>
              <span>Tesis Finalizada (Egresado)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-sky-300"></span>
              <span>Tesis en Curso (Estudiante)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-purple-300"></span>
              <span>Apoyo por Mentoría</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300"></span>
              <span>Apoyo por Donación</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Consola de Ficha y Reseña UCR */}
        <div className="lg:col-span-4 bg-white/80 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm backdrop-blur-md min-h-[480px] lg:min-h-0 h-full overflow-y-auto">
          {selectedNode && selectedNode.raw ? (
            <div key={selectedNode.id} className="space-y-4 animate-slide-telemetry-light">
              
              <div className="flex justify-between items-start border-b border-[#005B70]/15 pb-3">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-[#005B70] uppercase font-black">Expediente de Red</span>
                  <h4 className="text-lg font-black text-[#004857] uppercase leading-tight tracking-wide">{selectedNode.label}</h4>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {selectedNode.type === 'mentor' ? (
                <div className="space-y-3 font-brand-body text-xs text-slate-600">
                  <div className="p-3.5 bg-amber-500/5 border border-amber-200/70 rounded-xl space-y-1.5">
                    <span className="text-amber-700 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 font-mono">
                      <span className="material-symbols-outlined text-xs">history_edu</span> Origen Académico
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed font-light">
                      Este nodo representa tu mentor original registrado. Es la semilla que impulsó tu desarrollo profesional, y cuyo legado multiplicas hoy en las nuevas generaciones.
                    </p>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-2.5">
                    <span className="text-slate-500 font-mono text-[11.5px]">Contacto Académico:</span>
                    <span className="text-[#004857] font-bold text-xs sm:text-sm truncate max-w-[200px]">{selectedNode.raw.correo}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs text-slate-700 font-brand-body">
                  
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/80 space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-1.5 text-[#005B70] font-mono text-[11px] uppercase font-extrabold tracking-widest">
                      <span className="material-symbols-outlined text-[16px]">{selectedNode.raw.icono}</span>
                      {selectedNode.raw.tipoSemilla || "Semilla de Legado"}
                    </div>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed font-light">
                      "{selectedNode.raw.metafora}"
                    </p>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/20 p-4.5 space-y-2.5">
                    <span className="absolute left-1.5 top-1 text-[9px] text-emerald-400 font-mono select-none">+</span>
                    <span className="absolute right-1.5 top-1 text-[9px] text-emerald-400 font-mono select-none">+</span>
                    <span className="absolute left-1.5 bottom-1 text-[9px] text-emerald-400 font-mono select-none">+</span>
                    <span className="absolute right-1.5 bottom-1 text-[9px] text-emerald-400 font-mono select-none">+</span>

                    <div className="absolute right-3 top-3 text-[#10B981]/20 font-symbols select-none">
                      <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                    </div>
                    <div className="text-[11px] font-mono tracking-widest text-[#059669] uppercase font-extrabold flex items-center gap-1 pl-1">
                      <span>Proyecto de Graduación</span>
                      <span className="text-[#059669] font-black">✓</span>
                    </div>
                    <h5 className="text-[14px] font-black text-[#004857] leading-snug pr-6 pl-1">
                      "{selectedNode.raw.proyecto || 'Proyecto de Graduación'}"
                    </h5>
                    <div className="flex justify-between items-center pt-2.5 border-t border-emerald-100 text-[12px] font-mono pl-1">
                      <span className="text-slate-500">Evaluación Tesis:</span>
                      <span className="text-emerald-700 font-extrabold uppercase">{selectedNode.raw.tesisStatus || 'Tesis Aprobada'}</span>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-purple-200 bg-purple-50/20 p-4.5 space-y-3">
                    <div className="absolute -left-1.5 -top-2.5 text-purple-400/10 font-symbols select-none">
                      <span className="material-symbols-outlined text-3xl">format_quote</span>
                    </div>
                    <div className="flex justify-between items-center relative z-10 border-b border-purple-100/50 pb-2">
                      <div className="text-[11px] font-mono tracking-widest text-purple-700 uppercase font-extrabold">
                        Reseña del Estudiante
                      </div>
                      {renderStars(selectedNode.raw.calificacion || 5)}
                    </div>
                    <p className="text-[13px] italic text-purple-950/80 leading-relaxed font-light relative z-10 pl-1.5">
                      "{selectedNode.raw.resena || 'Agradecido por tu colaboración y mentoría constante.'}"
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3 font-mono text-[12px]">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Vínculo Académico:</span>
                      <span className="text-emerald-600 font-bold uppercase flex items-center gap-1">
                        Match Exitoso <span className="material-symbols-outlined text-[12px] font-black">verified</span>
                      </span>
                    </div>
                    {selectedNode.raw.horasMentoria > 0 && (
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Horas Compartidas:</span>
                        <span className="text-slate-800 font-bold">{selectedNode.raw.horasMentoria} Horas</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Donación Confirmada:</span>
                      <span className={selectedNode.raw.totalDonado > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                        {selectedNode.raw.totalDonado > 0 
                          ? `₡${selectedNode.raw.totalDonado.toLocaleString('es-CR')} ✓` 
                          : '₡0'}
                      </span>
                    </div>
                  </div>

                  {selectedNode.raw.esMentorActivo && (
                    <div className="p-3.5 bg-purple-50/50 border border-purple-200/50 rounded-xl text-[12px] text-purple-800 space-y-2">
                      <p className="font-bold font-mono flex items-center gap-1.5 text-purple-700 uppercase tracking-wider text-[11px]">
                        <span className="material-symbols-outlined text-[14px] fill-current text-purple-600 animate-pulse">eco</span>
                        Polinización en Cadena
                      </p>
                      <p className="font-light leading-normal">
                        Este egresado se ha convertido en mentor de la red y ahora guía a: <strong>{selectedNode.raw.hijos.join(', ')}</strong>.
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            <div className="my-auto text-center p-5">
              <span className="material-symbols-outlined text-5xl text-[#005B70]/40 mb-3.5 animate-pulse">settings_input_antenna</span>
              <h5 className="font-bold text-sm uppercase tracking-wider text-[#004857]">Expediente de Red</h5>
              <p className="text-[12.5px] text-slate-500 leading-relaxed mt-2.5 max-w-[260px] mx-auto font-light">
                Selecciona cualquier nodo o semilla del diagrama de red para desplegar los detalles de match, tesis aprobadas, donaciones y reseñas con estrellas.
              </p>
            </div>
          )}

          <div className="border-t border-slate-200/80 pt-3.5 text-[10.5px] font-mono text-slate-400 flex justify-between">
            <span>NODE_ID: {selectedNode ? selectedNode.id.toUpperCase() : 'STANDBY'}</span>
            <span>SYSTEM: ALINEADO_100</span>
          </div>
        </div>

      </div>
    </div>
  );
}
