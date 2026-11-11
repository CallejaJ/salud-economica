# Salud Económica

<div align="left">
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Motion-12-FFF312?style=for-the-badge&logo=framer&logoColor=black" alt="Motion" />
    <img src="https://img.shields.io/badge/Claude-Opus_5.5-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude" />
    <img src="https://img.shields.io/badge/PDF.js-6.4-B40000?style=for-the-badge" alt="PDF.js" />
    <img src="https://img.shields.io/badge/Jest-30-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
    <img src="https://img.shields.io/badge/Playwright-E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" />
    <img src="https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

<p align="left">
    <i>Aplicación de finanzas personales que responde con palabras y colores si el dinero llega a fin de mes, pensada para personas con discalculia.</i>
</p>

## Veredicto del Mes

La vista del mes empieza con una sola respuesta en lugar de una tabla de cifras. El veredicto sale de restar los gastos a los ingresos del mes (`summarize` en `lib/finance.ts`), y las cantidades que lo acompañan van redondeadas con `roughAmount` para leerse de un vistazo.

| Veredicto | Condición | Color | Información extra |
|---|---|---|---|
| **Sí, llegas a fin de mes** | Queda el 10 % de los ingresos o más | Turquesa | Dinero disponible por día restante |
| **Llegas, pero muy justo** | Queda menos del 10 % de los ingresos | Ámbar | Dinero que queda para imprevistos |
| **No llegas este mes** | Los gastos superan a los ingresos | Rojo | Dinero que falta |
| **Falta apuntar lo que cobras** | Hay gastos pero ningún ingreso | Ámbar | Total gastado hasta ahora |
| **Aún no hay nada este mes** | No hay apuntes | Neutro | Accesos a apuntar o subir extracto |

## Categorías de Gasto

Cada gasto pertenece a una de diez categorías (casa, comida, transporte, facturas, ocio, deportes, gastos colegio, extraescolares, regalos y otros), con icono y color propios (tokens `--cat-*` en ambos temas) para reconocerlas sin leer números. Las categorías forman la barra del dinero y el desglose, que describe cada parte con palabras («un tercio de lo que entra») mediante `shareWord`.

Para cambiar la categoría de un gasto ya guardado basta con tocar su icono (o el nombre de la categoría) en **Apuntes de este mes** y elegir otra en el selector que se abre dentro de la misma tarjeta. El apunte queda marcado como elegido a mano (`categoryByHand`), así que volver a subir el mismo extracto no lo devuelve a la categoría automática.

| Categoría | Apuntes típicos | Palabras clave del lector simple |
|---|---|---|
| **Casa** | Alquiler, hipoteca, comunidad | `alquiler`, `hipoteca`, `comunidad` |
| **Comida** | Supermercado, mercado | `mercadona`, `carrefour`, `lidl` |
| **Transporte** | Gasolina, transporte público, coche | `repsol`, `renfe`, `parking` |
| **Facturas** | Luz, agua, móvil, seguros | `endesa`, `movistar`, `mapfre` |
| **Ocio** | Restaurantes, suscripciones, ropa | `netflix`, `spotify`, `zara` |
| **Otros** | Todo lo demás | Valor por defecto |

## Importación del Extracto

El usuario puede subir el extracto en PDF que descarga de su banco. El texto se extrae en el navegador con **PDF.js**, así que el archivo nunca sale del dispositivo; solo las líneas de texto viajan a `/api/statement`. Todos los movimientos se muestran para revisarlos, con casilla y categoría editable, antes de guardarse en el mes de su fecha. Si se vuelve a subir el mismo extracto, los movimientos que ya estaban (mismo día, importe, signo y concepto) no se duplican: se actualiza su categoría con la elegida en la revisión, salvo la de los apuntes que el usuario ya cambió a mano. Los conceptos con «comedor», «aula matinal» o «extraescolar» se clasifican como gastos colegio.

| Fase | Dónde se ejecuta | Detalle |
|---|---|---|
| **Extracción de texto** | Navegador (`pdfToLines`) | Agrupa el texto del PDF en líneas por posición vertical, hasta 20 páginas |
| **Lectura con IA** | Servidor (`app/api/statement/route.ts`) | Claude devuelve los movimientos según un esquema JSON, validados con `cleanTransactions` |
| **Lectura simple** | Navegador (`parseLines`) | Expresión regular de fecha e importe en formato español si la API no está disponible |
| **Revisión** | Navegador (`StatementImport`) | El usuario confirma o descarta cada movimiento antes de guardar |

## Apuntes Recurrentes

Los apuntes marcados con «Se repite» guardan un mes de inicio (`month`), una frecuencia (`every`) y un mes final opcional (`until`). `entriesFor` incluye cada apunte recurrente que toca en el mes elegido, así que la nómina, el agua o el seguro se apuntan una sola vez.

| Frecuencia | `every` | Ejemplo |
|---|---|---|
| Cada mes | 1 | Nómina, alquiler, móvil |
| Cada 2 meses | 2 | Agua, luz en algunas compañías |
| Cada 3 meses | 3 | Comunidad, seguro trimestral |
| Cada año | 12 | IBI, seguro del coche |

Cuando el gasto no es mensual, el formulario dice cuánto conviene apartar cada mes para tenerlo listo (importe ÷ meses, redondeado). Los apuntes guardados antes de existir `every` se repiten cada mes. Al borrar uno recurrente se puede quitar desde el mes actual o borrar de todos los meses. Bajo la lista, **Borrar todos los de este mes** quita de una vez, tras una sola confirmación, los apuntes del mes que no se repiten.

## Copia de Seguridad

Los apuntes viven solo en el navegador, así que la vista del mes incluye un panel para guardarlos en un archivo JSON y recuperarlos después, en el mismo dispositivo o en otro. Nada pasa por el servidor.

| Acción | Qué hace |
|---|---|
| **Descargar copia** | Baja `salud-economica-AAAA-MM-DD.json` con todos los apuntes (`app`, `version`, `exportedAt`, `entries`) |
| **Cargar una copia** | Lee un archivo descargado antes, valida cada apunte con `parseBackup` y añade solo los que no están ya guardados (mismo `id`) |
| **Borrar todos mis datos** | Vacía los apuntes de este navegador tras una confirmación que ofrece descargar antes una copia |

## System Architecture

| Component | Role |
|---|---|
| **`app/layout.tsx`** | Metadatos, script de tema, JSON-LD, proveedores de idioma y animación, cabecera y pie |
| **`app/page.tsx`** | Estado de apuntes, mes, vista activa y avisos; datos de ejemplo etiquetados cuando no hay apuntes |
| **Vista del mes** | `Verdict`, `MoneyBreakdown` y `EntryList` en tres columnas desde 1200 px |
| **Formulario** | `EntryForm` con tipo, categoría por icono, importe, nota e interruptor de recurrente |
| **Importador** | `StatementImport` y `DropZone`: lee el PDF, llama a la API y muestra la revisión |
| **Copia de seguridad** | `BackupPanel` descarga y carga el archivo JSON con `lib/backup.ts` |
| **Lógica** | `lib/finance.ts`, `lib/statement.ts`, `lib/storage.ts`, `lib/backup.ts`, sin React y con tests |
| **API del extracto** | `app/api/statement/route.ts` con límite por IP y llamada a Claude |
| **Claude API** | Lee extractos de bancos españoles y clasifica cada movimiento |
| **localStorage** | Guarda los apuntes en `salud-economica.entries`, solo en el dispositivo |

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5 en modo estricto
- **Estilos**: una hoja `app/globals.css` con variables CSS, tema oscuro por defecto y tema claro
- **Animación**: Motion 12 con `reducedMotion="user"`
- **PDF**: `pdfjs-dist` 6.4 cargado bajo demanda
- **Backend/API**: ruta de Next.js en Node.js sobre Vercel
- **IA**: Claude Opus 5.5 con `@anthropic-ai/sdk` 1.1, salida JSON con esquema y respaldo ante rechazos
- **Almacenamiento**: `localStorage` del navegador
- **Testing**: Jest 30 con ts-jest, Playwright para E2E
- **Deployment**: Vercel, con CI en GitHub Actions sobre Node 22

## Key Features

1. **Primero la respuesta** — el mes se resume en una frase y un color antes de mostrar ninguna cifra.
2. **Números amables** — los totales se leen como «unos 250 €» y las partes como «un tercio de lo que entra».
3. **Dinero por día** — lo que queda se reparte entre los días que faltan para acabar el mes.
4. **Barra del dinero** — los ingresos son la barra entera, cada categoría un color y lo rayado lo que queda.
5. **Extracto del banco con revisión** — los movimientos se leen y clasifican solos, y se confirman uno a uno.
6. **Se apunta una vez** — ingresos y gastos fijos aparecen solos en los meses siguientes.
7. **Privado por defecto** — los apuntes se quedan en el dispositivo y el PDF nunca se sube.
8. **Bilingüe** — interfaz completa en español e inglés.
9. **Explica por qué ayuda** — bajo la leyenda, un apartado plegable cuenta en seis puntos por qué la app sirve a personas con discalculia.

## Testing Strategy

La lógica de `lib/` tiene tests unitarios con **Jest** (`lib/__tests__/`): importes, meses, recurrentes, veredictos, lector simple de extractos, validación de la respuesta de la API, almacenamiento, límite de peticiones y paridad de textos entre idiomas. `tests/e2e/app.test.js` arranca el build de producción y, con **Playwright**, crea apuntes a mano, importa un extracto PDF generado con `pdf-lib` y comprueba los archivos de SEO. GitHub Actions ejecuta `npm test` y `npm run build` en cada push y pull request.

## Localization

Todos los textos viven en `lib/strings.ts` con las mismas claves en `en` y `es`; un test falla si falta alguna. `LanguageProvider` arranca en inglés, recuerda el español en `localStorage("lang")` y actualiza `lang` del documento. Los importes y meses se formatean con `Intl` según el idioma (`lib/format.ts`).

## Project Setup

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea `.env.local`:

   ```env
   # Sitio
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Claude API (solo servidor, opcional: sin ella se usa el lector simple)
   ANTHROPIC_API_KEY=sk-ant-tu-clave
   ```

3. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre `http://localhost:3000`

5. Para los tests E2E, compila y lánzalos:

   ```bash
   npm run build && npm run test:e2e
   ```

---

Built for people who find numbers hard, by [Diseño Web Málaga](https://jorgecalleja.dev).
