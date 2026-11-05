// Recibe el texto de un extracto bancario (líneas sacadas del PDF en el navegador)
// y devuelve los movimientos ordenados usando Claude.
// Requiere la variable de entorno ANTHROPIC_API_KEY en Vercel.
import Anthropic from "@anthropic-ai/sdk";

const CATEGORIAS = ["casa", "comida", "transporte", "facturas", "ocio", "otros", "ingreso"];

const SCHEMA = {
  type: "object",
  properties: {
    movimientos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          fecha: { type: "string", description: "AAAA-MM-DD" },
          concepto: { type: "string" },
          importe: { type: "number" },
          categoria: { type: "string", enum: CATEGORIAS },
        },
        required: ["fecha", "concepto", "importe", "categoria"],
        additionalProperties: false,
      },
    },
  },
  required: ["movimientos"],
  additionalProperties: false,
};

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Usa POST" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(501).json({ error: "Lectura con IA no configurada" });
  }

  const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
  const text = lines.map(String).join("\n");
  if (!text.trim()) return res.status(400).json({ error: "El extracto está vacío" });
  if (text.length > 200_000) return res.status(413).json({ error: "El extracto es demasiado largo" });

  const year = new Date().getFullYear();
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      system:
        "Lees extractos bancarios españoles. Extrae solo los movimientos de la cuenta: " +
        "ignora saldos, totales, cabeceras y publicidad. " +
        "importe es negativo para cargos o gastos y positivo para abonos o ingresos. " +
        "concepto es un texto corto y claro de máximo 40 caracteres (por ejemplo «Mercadona» en vez del código completo). " +
        "categoria: casa (alquiler, hipoteca, comunidad), comida (supermercados), transporte, " +
        "facturas (luz, agua, gas, teléfono, seguros), ocio (restaurantes, suscripciones, ropa), otros; " +
        "usa «ingreso» para cualquier importe positivo. " +
        `Si una fecha no trae año, usa ${year}.`,
      messages: [{ role: "user", content: "Texto del extracto:\n\n" + text }],
    });

    if (response.stop_reason === "refusal") {
      return res.status(422).json({ error: "No se pudo leer este extracto" });
    }
    const block = response.content.find((b) => b.type === "text");
    const data = JSON.parse(block?.text ?? "{}");
    return res.status(200).json({ movimientos: data.movimientos ?? [] });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Demasiadas peticiones, prueba en un minuto" });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return res.status(502).json({ error: "El servicio de lectura falló" });
    }
    console.error(err);
    return res.status(500).json({ error: "Error inesperado" });
  }
}
