import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PerfilEstudianteProvider } from "@/context/PerfilEstudianteContext";
import NavigationSpinner from "@/components/NavigationSpinner";

export const metadata: Metadata = {
  title: "Conectando Talento",
  description: "Plataforma de vinculación laboral y académica para la UCR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Fuentes vía <link> (más confiable que @import en CSS con el nuevo
            PostCSS/Tailwind). Material Symbols con display=block para no mostrar
            el texto del ligature mientras carga. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <PerfilEstudianteProvider>
            <NavigationSpinner />
            {children}
          </PerfilEstudianteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
