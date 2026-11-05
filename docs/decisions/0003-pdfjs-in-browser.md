# 0003. Read Statement PDFs in the Browser with pdf.js

- **Date**: 2026-11-05
- **Status**: Accepted

## Context

To import a bank statement the app needs the text of the PDF. Sending the file to a server would expose a sensitive document and contradict the privacy promise.

## Decision

Add `pdfjs-dist` as a dependency and extract text in the browser (`lib/pdfText.ts`), grouping text items into lines by vertical position. The module is loaded dynamically, only when the user picks a file.

## Alternatives

| Option | Why not |
|---|---|
| **pdf.js from a CDN** | Extra origin at runtime and no type checking |
| **Server-side parsing** | The PDF would leave the device |
| **pdf-lib** | Edits PDFs but does not extract text |

## Consequences

- The import flow adds a lazily loaded chunk and worker of about 1 MB
- Scanned statements without a text layer still cannot be read
