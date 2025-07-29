"use client";
import { useState } from 'react';

interface CaseOption {
  id: string;
  label: string;
}

const CASES: CaseOption[] = [
  { id: 'replace-word', label: 'Replace word' },
  { id: 'add-line', label: 'Add line' },
  { id: 'complex-edit', label: 'Complex edit' },
];

export default function SmartDiffTestPage() {
  const [selectedCase, setSelectedCase] = useState<string>('replace-word');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/tests/smart-diff?case=${selectedCase}`);
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
      <h1 className="text-2xl font-semibold">smart_diff Tool Test</h1>

      <label className="block text-sm font-medium">Select test case:</label>
      <select
        value={selectedCase}
        onChange={(e) => setSelectedCase(e.target.value)}
        className="border px-3 py-1 rounded"
      >
        {CASES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Run Test'}
      </button>

      {error && <p className="text-red-600">Error: {error}</p>}

      {result && (
        <pre className="bg-gray-100 text-gray-800 p-4 overflow-auto text-sm max-h-[70vh]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
