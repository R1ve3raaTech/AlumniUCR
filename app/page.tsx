import React from 'react';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-card" style={{
        position: 'sticky',
        top: '1rem',
        margin: '0 2rem',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        marginTop: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 0 15px hsla(250, 85%, 65%, 0.4)'
          }}>
            CT
          </div>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: 700, 
            fontSize: '1.25rem',
            background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Conectando Talento UCR
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#" className="nav-link" style={{ fontSize: '0.9rem' }}>Inicio</a>
          <a href="#" className="nav-link" style={{ fontSize: '0.9rem' }}>Alumnos</a>
          <a href="#" className="nav-link" style={{ fontSize: '0.9rem' }}>Empresas</a>
          <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Iniciar Sesión</button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
        {/* Hero Section */}
        <section style={{ maxWidth: '800px', textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            color: 'hsl(var(--secondary))',
            fontWeight: 500,
            marginBottom: '2rem',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
          }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Nueva Plataforma de Vinculación UCR
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            marginBottom: '1.5rem',
            lineHeight: 1.15
          }}>
            Impulsa tu Futuro Profesional con{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Conectando Talento
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'hsl(var(--muted-foreground))',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            marginInline: 'auto'
          }}>
            La plataforma oficial para conectar estudiantes y egresados de la Universidad de Costa Rica con las mejores oportunidades del sector empresarial.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary pulse-glow">
              Comenzar Ahora
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
            <button className="btn-secondary">
              Saber Más
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          maxWidth: '900px',
          width: '100%',
          marginBottom: '5rem'
        }}>
          {[
            { value: '98%', label: 'Vinculación Exitosa', desc: 'Porcentaje de egresados que logran contacto inicial.' },
            { value: '150+', label: 'Empresas Aliadas', desc: 'Compañías nacionales y multinacionales en constante búsqueda.' },
            { value: '2.4k+', label: 'CVs Activos', desc: 'Estudiantes calificados listos para marcar la diferencia.' },
          ].map((stat, i) => (
            <div key={i} className="glass-card stat-card" style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                {stat.value}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{stat.label}</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{stat.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-card" style={{
        margin: '0 2rem 2rem 2rem',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        color: 'hsl(var(--muted-foreground))'
      }}>
        <span>&copy; {new Date().getFullYear()} Conectando Talento UCR. Todos los derechos reservados.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" className="nav-link">Términos de Servicio</a>
          <a href="#" className="nav-link">Política de Privacidad</a>
          <a href="#" className="nav-link">Soporte</a>
        </div>
      </footer>
    </div>
  );
}
