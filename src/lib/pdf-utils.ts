import PDFParser from "pdf2json";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);

    pdfParser.on("pdfParser_dataError", (errData: any) =>
      reject(new Error(errData.parserError))
    );

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      // pdf2json returns raw content, try to use getRawTextContent() if available or parse the output
      // simpler usage for text:
      // construct text from pdfData
      // Actually, constructor option 1 enables raw text parsing?
      // let's check documentation or types.
      // pdfData.formImage.Pages...
      // It's simpler to use `pdfParser.getRawTextContent()` on ready?
      // No, `pdfParser.getRawTextContent()` returns the content.
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (e) {
      reject(e);
    }
  });
}
