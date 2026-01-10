import PDFParser from "pdf2json";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // Suppress "Setting up fake worker" warning from pdf.js (used by pdf2json)
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes("Setting up fake worker")) return;
        originalWarn.apply(console, args);
    };

    const pdfParser = new PDFParser(null, true);
    console.warn = originalWarn;

    pdfParser.on("pdfParser_dataError", (errData: unknown) => {
        const parserError = (errData as { parserError: string })?.parserError || "Unknown PDF parsing error";
        reject(new Error(parserError));
    });

    pdfParser.on("pdfParser_dataReady", () => {
      // pdf2json returns raw content
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (e: unknown) {
      reject(e);
    }
  });
}
