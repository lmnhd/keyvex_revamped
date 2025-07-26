"use client";
import { useState } from 'react';
import { ToolRenderer } from '@/components/canvas/tool-renderer';
import { Tool } from '@/lib/types/tool';

export default function CodeAgentTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [generatedTool, setGeneratedTool] = useState<Tool | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tests/code-agent');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
      if (json.success && json.tool) {
        setGeneratedTool(json.tool as Tool);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Code-Generation Agent Test</h1>
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Run Test'}
      </button>

      {error && <p className="text-red-600">Error: {error}</p>}

      {generatedTool && (
        <div className="border p-4 rounded bg-muted mb-6">
          <h2 className="text-lg font-medium mb-2">Generated Tool Preview</h2>
          <ToolRenderer tool={generatedTool} className="min-h-[400px]" />
        </div>
      )}

      {result && (
        <pre className="bg-gray-100 text-gray-800 p-4 overflow-auto text-sm max-h-[70vh]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
