import { NextResponse } from 'next/server';
import Replicate from "replicate";

export async function POST(request) {
  try {
    // Instanciado dentro del handler (no a nivel de módulo): igual que en
    // app/api/alumni-chat/route.ts, si el token falta el SDK lanza al
    // construirse, y a nivel de módulo eso tumba la función entera con un 500
    // genérico de Next.js sin pasar por este try/catch.
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('Replicate: falta REPLICATE_API_TOKEN en las variables de entorno.');
      return NextResponse.json(
        { error: "La generación de imágenes no está disponible en este momento." },
        { status: 500 },
      );
    }
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const { prompt, aspect_ratio = "1:1", tipo = "schnell" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "El prompt es obligatorio" }, { status: 400 });
    }

    // Usamos FLUX.1 [schnell] por defecto (rápido y económico) o [dev] para máxima calidad gráfica
    const modelo = tipo === "dev" ? "black-forest-labs/flux-dev" : "black-forest-labs/flux-schnell";

    console.log(`[Next.js API] Conectando con Replicate. Modelo: ${modelo}`);

    const output = await replicate.run(modelo, {
      input: {
        prompt,
        aspect_ratio,
        output_format: "webp",
        output_quality: 90
      }
    });

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl 
    });

  } catch (error) {
    console.error("❌ Error en el Route Handler de Replicate:", error);
    return NextResponse.json({ 
      error: "Error interno en el servidor al generar la imagen" 
    }, { status: 500 });
  }
}
