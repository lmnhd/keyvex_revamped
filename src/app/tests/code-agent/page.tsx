"use client";
import { useState } from 'react';

export default function CodeAgentTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tests/code-agent');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
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

      {result && (
        <pre className="bg-gray-100 p-4 overflow-auto text-sm max-h-[70vh]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
