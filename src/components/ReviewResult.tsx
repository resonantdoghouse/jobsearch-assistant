import ReactMarkdown from "react-markdown";

export function ReviewResult({ analysis }: { analysis: string }) {
  if (!analysis) return null;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 prose prose-blue max-w-none">
      <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Analysis Results</h3>
      <div className="result-content">
         {/* We will just render it as raw markdown for now, or use a markdown renderer if installed.
             For now, pre-wrap to preserve structure if no renderer is available, 
             but I will assume we might want to install one or just use pre-wrap.
             Actually, I should probably install react-markdown for better display.
             For this step, I'll use simple whitespace preservation.
          */}
         <pre className="whitespace-pre-wrap font-sans text-gray-700">{analysis}</pre>
      </div>
    </div>
  );
}
