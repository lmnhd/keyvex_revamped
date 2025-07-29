"use client";
import { useState } from 'react';
import { ToolRenderer } from '@/components/canvas/tool-renderer';
import { Tool } from '@/lib/types/tool';

export default function CodeAgentTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [generatedTool, setGeneratedTool] = useState<Tool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setProgress('Initializing FileCoder agent...');
    
    try {
      // Set progress updates for longer execution time
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.includes('Smart-diff tool processing')) {
            return 'Smart-diff tool processing (this may take up to 1 minute)...';
          } else if (prev.includes('Smart-diff tool processing (this may take up to 1 minute)')) {
            return 'Smart-diff tool processing (this may take up to 1 minute)...';
          } else {
            return 'Smart-diff tool processing...';
          }
        });
      }, 5000);

      const res = await fetch('/api/tests/code-agent');
      
      clearInterval(progressInterval);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Handle timeout errors specifically
        if (res.status === 408 || errorData.timeout) {
          throw new Error('Agent execution timed out. Smart-diff tool operations can take up to 1 minute. Please try again.');
        }
        
        throw new Error(`HTTP ${res.status}: ${errorData.error || 'Unknown error'}`);
      }
      
      setProgress('Processing results...');
      const json = await res.json();
      setResult(json);
      
      if (json.success && json.result) {
        // Try to parse the result as a tool
        try {
          const toolData = JSON.parse(json.result);
          if (toolData.componentCode) {
            setGeneratedTool(toolData as Tool);
          }
        } catch (parseError) {
          console.log('Result is not a tool object:', json.result);
        }
      }
      
      setProgress('Complete!');
    } catch (err: any) {
      setError(err.message);
      setProgress('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Code-Generation Agent Test</h1>
      
      <div className="space-y-2">
        <button
          onClick={runTest}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? 'Running…' : 'Run Test'}
        </button>
        
        {loading && progress && (
          <div className="text-sm text-gray-600">
            <p>{progress}</p>
            <p className="text-xs mt-1">Note: Smart-diff tool may take up to 1 minute for complex modifications</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded">
          <h3 className="font-medium text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {generatedTool && (
        <div className="border p-4 rounded bg-muted mb-6">
          <h2 className="text-lg font-medium mb-2">Generated Tool Preview</h2>
          <ToolRenderer tool={generatedTool} className="min-h-[400px]" />
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Raw Results:</h3>
          <pre className="bg-gray-100 text-gray-800 p-4 overflow-auto text-sm max-h-[70vh] rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
