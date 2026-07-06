import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
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
