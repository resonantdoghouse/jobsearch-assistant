import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export const downloadPDF = (content: string, filename: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;

  // Split text into lines that fit the page
  const splitText = doc.splitTextToSize(content, maxLineWidth);

  doc.setFontSize(12);
  doc.text(splitText, margin, 30);

  doc.save(`${filename}.pdf`);
};

export const downloadDOCX = async (content: string, filename: string) => {
  // Split content by newlines to create separate paragraphs
  const paragraphs = content.split("\n").map((line) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          size: 24, // 12pt font size (half-points)
        }),
      ],
      spacing: {
        after: 200, // Space after paragraph
      },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

export const downloadRTF = (content: string, filename: string) => {
  // Basic RTF header and footer
  const header = "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}\n";
  const footer = "}";
  
  // Escape special RTF characters and convert newlines
  const rtfContent = content
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\n/g, "\\par\n");

  const fullContent = `${header}\\fs24 ${rtfContent}\n${footer}`;
  
  const blob = new Blob([fullContent], { type: "application/rtf" });
  saveAs(blob, `${filename}.rtf`);
};
