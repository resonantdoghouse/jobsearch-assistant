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

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        let parsedText = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pdfData.Pages.forEach((page: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          page.Texts.forEach((text: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            text.R.forEach((r: any) => {
              parsedText += decodeURIComponent(r.T) + " ";
            });
          });
          parsedText += "\n";
        });
        resolve(parsedText);
      } catch (e) {
        reject(e);
      }
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (e: unknown) {
      reject(e);
    }
  });
}
