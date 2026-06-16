import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GlobalChatbot from "@/components/GlobalChatbot";

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
      <body>
        <AuthProvider>
          {children}
          <GlobalChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
