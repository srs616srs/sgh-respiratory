import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { notes, title, branchContext } = await req.json();

    if (!notes?.trim()) {
      return NextResponse.json({ error: 'Meeting notes are required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI generation not configured. Add ANTHROPIC_API_KEY to your .env.local file.' }, { status: 503 });
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are the administrator for ${branchContext} — Respiratory Services, Saudi German Hospital.
Generate a formal Minutes of Meeting from the notes below.
Format: Header (Department, Branch: ${branchContext}, Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, Chairperson: Sultan Alshehri, Network Director), ━━━ separator, 1. ATTENDANCE, 2. AGENDA & DISCUSSION (2.1, 2.2...), 3. ACTION ITEMS (plain text table: Action | Owner | Deadline), 4. NEXT MEETING, Footer: "Minutes recorded by: Sultan Alshehri". Formal tone, plain text only.
Title: "${title || 'Department Meeting'}"
Notes:\n${notes}`,
      }],
    });

    const text = message.content?.map(b => b.text || '').join('') || '';
    return NextResponse.json({ mom: text });
  } catch (err) {
    console.error('AI MOM error:', err);
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 });
  }
}
