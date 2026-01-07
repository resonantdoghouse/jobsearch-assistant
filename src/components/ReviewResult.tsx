import ReactMarkdown from "react-markdown";

export function ReviewResult({ analysis }: { analysis: string }) {
  if (!analysis) return null;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 prose prose-blue max-w-none">
      <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Analysis Results</h3>
      <div className="result-content text-gray-700">
         <ReactMarkdown 
            components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-blue-800" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-blue-700" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-600" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
            }}
         >
            {analysis}
         </ReactMarkdown>
      </div>
    </div>
  );
}
