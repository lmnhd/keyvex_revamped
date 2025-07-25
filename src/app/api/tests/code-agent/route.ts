import { NextRequest, NextResponse } from 'next/server';

// Updated Test Endpoint
// GET /api/tests/code-agent
// Invokes the new FileCoder surgical pipeline with a fixed prompt
// and returns the full JSON result so frontend pages can render the
// generated tool and inspect intermediary data.

/** Default prompt used if `prompt` query param is not provided */
const DEFAULT_PROMPT = 'I need a mortgage payment calculator for real estate agents';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const userPrompt = searchParams.get('prompt') ?? DEFAULT_PROMPT;

  try {
    const pipelineRes = await fetch(`${origin}/api/ai/surgical-pipeline/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt }),
    });

    // If the downstream route fails, bubble the status back
    if (!pipelineRes.ok) {
      const errPayload = await pipelineRes.json();
      return NextResponse.json(errPayload, { status: pipelineRes.status });
    }

    // Successful pipeline run
    const data = await pipelineRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('tests/code-agent route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
