# Salud Económica

¿Llego a fin de mes? Una herramienta de finanzas personales muy sencilla, pensada para personas con discalculia.

- **Respuesta en palabras y colores**: verde (llegas), ámbar (vas justo), rojo (no llegas). Cifras redondeadas («unos 250 €») y cuánto puedes gastar al día.
- **Barra del dinero**: lo que entra es la barra entera; cada color es una categoría; lo rayado es lo que queda.
- **Apuntar a mano**: gasto o ingreso, categoría con icono, importe y «se repite cada mes».
- **Subir el PDF del banco**: el PDF se lee en el navegador con pdf.js, una función de Vercel (`/api/extracto`) ordena los movimientos con Claude y tú los revisas antes de guardar. Si la IA no está configurada, se usa una lectura simple por fecha e importe.

## Estructura

```
index.html        Página completa (HTML, CSS y JS sin build)
api/extracto.js   Función serverless de Vercel que llama a la API de Claude
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel (framework: *Other*, sin comando de build).
2. En *Settings → Environment Variables* añade `ANTHROPIC_API_KEY`.
3. Despliega.

## Datos

Los apuntes se guardan en el navegador de cada persona (`localStorage`): no salen del dispositivo y no se comparten entre dispositivos. El PDF no se guarda; solo su texto se envía a `/api/extracto` para ordenarlo.
