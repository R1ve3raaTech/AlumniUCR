import Image from 'next/image';
import styles from './landing.module.css';

export default function UCRAnexos() {
  return (
    <section className={styles.section} style={{ background: 'var(--brand-blanco)' }}>
      <div className={styles.container}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          
          {/* Lado izquierdo pegajoso (Sticky) */}
          <div data-anim="sticky-panel" style={{ position: 'sticky', top: '120px' }}>
            <span className={styles.eyebrow}>Impacto Global</span>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem', fontSize: 'clamp(2.5rem, 1.5rem + 2.5vw, 4rem)' }}>
              El Ecosistema<br/>Universitario
            </h2>
            <p className={styles.sectionLead} style={{ marginBottom: '2.5rem' }}>
              La Universidad de Costa Rica no es solo un campus, es un vasto ecosistema de 
              conocimiento que abarca todo el país y cruza fronteras. 
              Descubre los anexos y recursos que hacen de la UCR un referente mundial.
            </p>
            
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 48px -12px rgba(0, 76, 99, 0.2)' }}>
              <Image 
                src="/images/ecosistema-ucr.png" 
                alt="Investigación y desarrollo en el Ecosistema UCR" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
            </div>
          </div>

          {/* Lado derecho con scroll de tarjetas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            <div data-anim="anexo-card" style={{ background: 'var(--brand-celeste-claro)', padding: '3rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 className={styles.cardTitle} style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--brand-esmeralda)' }}>Sedes y Recintos Regionales</h3>
                <p className={styles.cardText} style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
                  Llevamos la excelencia académica a todo el territorio nacional. Con múltiples sedes y recintos distribuidos estratégicamente, descentralizamos la educación superior y fomentamos el desarrollo regional equitativo.
                </p>
              </div>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '12rem', opacity: 0.1, zIndex: 1 }}>🗺️</div>
            </div>

            <div data-anim="anexo-card" style={{ background: 'rgba(243, 75, 38, 0.08)', padding: '3rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 className={styles.cardTitle} style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--brand-naranja)' }}>Institutos de Investigación</h3>
                <p className={styles.cardText} style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
                  Más de 40 centros e institutos dedicados a la vanguardia científica. Desde la biología tropical y el estudio de volcanes hasta las ciencias espaciales y el desarrollo tecnológico sostenible.
                </p>
              </div>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '12rem', opacity: 0.1, zIndex: 1 }}>🔬</div>
            </div>

            <div data-anim="anexo-card" style={{ background: 'rgba(251, 175, 0, 0.1)', padding: '3rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 className={styles.cardTitle} style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--brand-amarillo)' }}>Red de Egresados UCR</h3>
                <p className={styles.cardText} style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
                  Una comunidad activa y global. Nuestros profesionales colaboran constantemente para abrir puertas, crear emprendimientos conjuntos y facilitar mentorías para las nuevas generaciones de estudiantes.
                </p>
              </div>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '12rem', opacity: 0.1, zIndex: 1 }}>🎓</div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
