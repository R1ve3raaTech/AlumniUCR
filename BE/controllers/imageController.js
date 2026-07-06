import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const generarImagenFlux = async (req, res) => {
  const { prompt, aspect_ratio = "1:1", tipo = "schnell" } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "El prompt es obligatorio." });
  }

  const modelo = tipo === "dev" ? "black-forest-labs/flux-dev" : "black-forest-labs/flux-schnell";

  try {
    console.log(`[Replicate] Generando imagen con modelo: ${modelo}`);
    
    const output = await replicate.run(modelo, {
      input: {
        prompt,
        aspect_ratio,
        output_format: "webp",
        output_quality: 90
      }
    });

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Error en Replicate API:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Error interno al generar la imagen." 
    });
  }
};
