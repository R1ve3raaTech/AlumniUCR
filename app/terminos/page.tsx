import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './terminos.module.css';

export const metadata: Metadata = {
  title: 'Términos y Condiciones · Alumni UCR',
  description:
    'Términos y Condiciones de uso de la plataforma de la Fundación Alumni-UCR: registro, matching, mentorías, pasantías, donaciones, proyectos y protección de datos.',
};

const IArrowBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
);
const ICheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.5 2.5L16 9.5" /></svg>
);

export default function TerminosPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Alumni UCR — inicio">
          Alumni<b>UCR</b>
        </Link>
        <Link href="/registro" className={styles.backLink}>
          <IArrowBack /> Volver al registro
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Términos y <em>Condiciones</em></h1>
          <div className={styles.accentBar} />
          <p className={styles.meta}>
            Los presentes Términos y Condiciones (en adelante, los “Términos”) regulan el acceso y uso de
            la plataforma digital de la <strong>Fundación Alumni-UCR</strong> (en adelante, la “Fundación” o la
            “Plataforma”), que conecta a estudiantes y personas graduadas de la Universidad de Costa Rica con
            fines de mentoría, formación, vinculación profesional y apoyo a la comunidad universitaria.
          </p>
          <span className={styles.updated}><ICheck /> Última actualización: junio de 2026</span>
        </div>

        <article className={styles.card}>
          <section className={styles.section}>
            <h2><span className={styles.num}>1</span> Aceptación de los Términos</h2>
            <p>
              Al registrarse, acceder o utilizar la Plataforma, la persona usuaria declara haber leído, comprendido
              y aceptado de forma libre y expresa estos Términos, así como la Política de Privacidad que forma parte
              integral de los mismos. Si no está de acuerdo con alguna disposición, deberá abstenerse de usar la
              Plataforma.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>2</span> Definiciones</h2>
            <ul>
              <li><strong>Estudiante:</strong> persona con vínculo académico activo con la UCR que utiliza la Plataforma para encontrar apoyo, mentoría u oportunidades.</li>
              <li><strong>Exalumno/a:</strong> persona graduada de la UCR que ofrece mentoría, pasantías, empleo, financiamiento, apadrinamiento o voluntariado.</li>
              <li><strong>Colaborador/a:</strong> persona o entidad que apoya la misión de la Fundación en otras modalidades.</li>
              <li><strong>Match:</strong> coincidencia sugerida entre personas usuarias con base en afinidades (carrera, áreas de interés, temática de proyecto y tipo de apoyo).</li>
              <li><strong>Contenido del usuario:</strong> datos, perfiles, proyectos, currículos y materiales que las personas usuarias publican en la Plataforma.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>3</span> Objeto y misión de la Plataforma</h2>
            <p>
              La Plataforma tiene como propósito facilitar la vinculación entre la comunidad estudiantil y los
              egresados de la UCR para promover el desarrollo del talento, la mentoría, la inserción profesional y
              el apoyo solidario. La Fundación actúa como <strong>facilitadora</strong> de estas conexiones y no es
              parte de las relaciones laborales, contractuales o económicas que las personas usuarias acuerden entre sí.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>4</span> Registro, cuentas y veracidad de la información</h2>
            <ul>
              <li>El registro requiere proporcionar información <strong>veraz, completa y actualizada</strong> (nombre, apellidos, identificación, correo y, según el rol, datos académicos).</li>
              <li>Las cuentas pueden quedar en estado <strong>pendiente de aprobación</strong> y ser verificadas por la Fundación antes de su activación.</li>
              <li>El uso del correo institucional <strong>@ucr.ac.cr</strong> u otros mecanismos de validación busca garantizar una comunidad real y confiable.</li>
              <li>La persona usuaria es responsable de la confidencialidad de sus credenciales y de toda actividad realizada desde su cuenta.</li>
              <li>La Fundación podrá rechazar, suspender o eliminar registros con información falsa, duplicada o que incumpla estos Términos.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>5</span> Uso aceptable y conducta de la persona usuaria</h2>
            <p>La persona usuaria se compromete a utilizar la Plataforma de buena fe y, en particular, a no:</p>
            <ul>
              <li>Suplantar identidades ni proporcionar información engañosa.</li>
              <li>Acosar, discriminar, difamar o dañar a otras personas usuarias.</li>
              <li>Publicar contenido ilícito, ofensivo o que infrinja derechos de terceros.</li>
              <li>Utilizar los datos de contacto con fines comerciales no autorizados, spam o reclutamiento abusivo.</li>
              <li>Vulnerar la seguridad de la Plataforma o acceder a información ajena sin autorización.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>6</span> Matching y conexiones</h2>
            <p>
              El sistema de matching ofrece <strong>sugerencias</strong> basadas en afinidades y puntajes orientativos.
              La Fundación no garantiza resultados específicos, la disponibilidad de las personas sugeridas, ni el éxito
              de las conexiones. La decisión de contactar, aceptar o continuar una relación corresponde exclusivamente a
              las personas usuarias.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>7</span> Mentorías, pasantías y oportunidades de empleo</h2>
            <p>
              Las mentorías, pasantías, prácticas y oportunidades de empleo publicadas son responsabilidad de quien las
              ofrece. La Fundación <strong>no es empleadora</strong> ni garante de dichas oportunidades, y no interviene en
              los términos económicos, contractuales o de cumplimiento pactados entre las partes. Se recomienda formalizar
              los acuerdos conforme a la legislación aplicable.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>8</span> Donaciones y aportes económicos</h2>
            <ul>
              <li>Las donaciones, apadrinamientos y patrocinios son <strong>voluntarios</strong> y se destinan a los fines de la Fundación o al proyecto/beca indicado.</li>
              <li>La Plataforma registra los aportes de forma transparente y permite a cada persona consultar su historial.</li>
              <li>Salvo error comprobado, los aportes realizados <strong>no son reembolsables</strong>. Cualquier solicitud se atenderá según las políticas internas de la Fundación.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>9</span> Contenido del usuario y propiedad intelectual</h2>
            <p>
              La persona usuaria conserva la titularidad de su Contenido (perfiles, proyectos de graduación, currículos,
              etc.) y declara contar con los derechos para publicarlo. Al hacerlo, otorga a la Fundación una licencia
              <strong> no exclusiva, gratuita y limitada</strong> para mostrar dicho contenido dentro de la Plataforma con el
              único fin de operar el servicio. La Plataforma, su marca, diseño y código son propiedad de la Fundación y
              están protegidos por la legislación aplicable.
            </p>
          </section>

          <section id="privacidad" className={styles.section}>
            <h2><span className={styles.num}>10</span> Privacidad y protección de datos</h2>
            <p>
              La Fundación trata los datos personales con <strong>discreción, confidencialidad y medidas de seguridad</strong>
              razonables, de conformidad con la <strong>Ley N.º 8968 de Protección de la Persona frente al tratamiento de sus
              datos personales</strong> de Costa Rica y su reglamento. Los datos se utilizan para operar el matching, gestionar
              cuentas, facilitar conexiones y mejorar el servicio.
            </p>
            <ul>
              <li>La persona usuaria puede ejercer sus derechos de acceso, rectificación, actualización y eliminación.</li>
              <li>No se venden datos personales a terceros. La información de contacto se comparte únicamente en el marco de las conexiones que la persona usuaria habilita.</li>
              <li>Se aplican controles de acceso y respaldo para resguardar la integridad de la información.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>11</span> Disponibilidad del servicio</h2>
            <p>
              La Fundación procura mantener la Plataforma disponible y ofrece soporte, incluyendo un canal de atención con
              tiempos de respuesta efectivos. No obstante, el servicio se brinda “tal cual” y podría interrumpirse por
              mantenimiento, causas técnicas o de fuerza mayor, sin que ello genere responsabilidad por daños indirectos.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>12</span> Limitación de responsabilidad</h2>
            <p>
              En la máxima medida permitida por la ley, la Fundación no será responsable por las conductas de las personas
              usuarias, por el resultado de las conexiones, mentorías u oportunidades, ni por daños derivados del uso o la
              imposibilidad de uso de la Plataforma. La persona usuaria utiliza el servicio bajo su propia responsabilidad.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>13</span> Suspensión y terminación</h2>
            <p>
              La Fundación podrá suspender o cancelar cuentas que incumplan estos Términos, que comprometan la seguridad de
              la comunidad o que hagan un uso indebido de la Plataforma. La persona usuaria puede solicitar la eliminación de
              su cuenta en cualquier momento a través de los canales de soporte.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>14</span> Modificaciones</h2>
            <p>
              La Fundación podrá actualizar estos Términos para reflejar mejoras del servicio o cambios normativos. Las
              modificaciones se comunicarán por medios razonables y el uso continuado de la Plataforma implicará la aceptación
              de la versión vigente.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>15</span> Legislación aplicable y jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la <strong>República de Costa Rica</strong>. Cualquier controversia se
              someterá a los tribunales competentes de Costa Rica, sin perjuicio de los mecanismos de resolución alternativa
              de conflictos que las partes acuerden.
            </p>
          </section>

          <section className={styles.section}>
            <h2><span className={styles.num}>16</span> Contacto</h2>
            <p>
              Para consultas sobre estos Términos, la Política de Privacidad o el ejercicio de derechos sobre datos personales,
              la persona usuaria puede comunicarse a través del <Link href="/ayuda">Centro de Ayuda</Link> de la Plataforma.
            </p>
            <div className={styles.callout}>
              Al marcar la casilla de aceptación durante el registro, la persona usuaria reconoce haber leído y aceptado
              estos Términos y Condiciones y la Política de Privacidad de la Fundación Alumni-UCR.
            </div>
          </section>
        </article>
      </main>

      <footer className={styles.footer}>
        <span>© 2026 Fundación Alumni UCR. Todos los derechos reservados.</span>
        <div className={styles.footerLinks}>
          <Link href="/terminos">Términos</Link>
          <Link href="/terminos#privacidad">Privacidad</Link>
          <Link href="/ayuda">Soporte</Link>
        </div>
      </footer>
    </div>
  );
}
