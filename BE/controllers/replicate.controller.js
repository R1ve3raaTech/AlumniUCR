exports.generarImagenFlux = async (req, res, next) => {
  const { prompt, aspect_ratio = "1:1", tipo = "schnell" } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "El prompt es obligatorio." });
  }

  // Selección automática de modelo según lo que pidas (schnell = rápido/barato, dev = premium)
  const modelo = tipo === "dev" ? "black-forest-labs/flux-dev" : "black-forest-labs/flux-schnell";

  try {
    console.log(`[Replicate] Cargando SDK e iniciando generación (${modelo})...`);
    
    // Importación dinámica obligatoria para paquetes ESM puros en entornos require()
    const { default: Replicate } = await import('replicate');
    
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(modelo, {
      input: {
        prompt,
        aspect_ratio,
        output_format: "webp",
        output_quality: 90
      }
    });

    // Validamos la respuesta limpia del array de URLs que devuelve Replicate
    const imageUrl = Array.isArray(output) ? output[0] : output;

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("❌ Error en Replicate Controller:", error);
    // Usamos tu middleware de errores global de Express
    next(error); 
  }
};
