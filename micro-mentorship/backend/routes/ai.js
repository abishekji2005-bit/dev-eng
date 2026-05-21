import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../supabase.js';

const r = Router();

// We support both xAI (Grok) and Groq API keys. 
// A 'gsk_' key is a Groq key, which uses api.groq.com. Otherwise, we default to x.ai.
const getAiConfig = () => {
  const key = process.env.GROK_API_KEY || '';
  if (key.startsWith('gsk_')) {
    return {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
    };
  }
  return {
    url: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-3-mini-fast',
  };
};

async function chatCompletions(messages, maxTokens = 1024) {
  const { url, model } = getAiConfig();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error ${res.status}: ${err}`);
  }
  return res.json();
}

function cleanJsonContent(content) {
  return content
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

// ──────────────────────────────────────────
// POST /api/ai/suggest-tags
// Body: { title, description }
// Returns: { suggestions: ["React", "Node.js", ...] }
// ──────────────────────────────────────────
r.post('/suggest-tags', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  // Fetch available tags from DB
  const { data: tags } = await supabase.from('tags').select('name').order('name');
  const tagNames = (tags || []).map(t => t.name);

  try {
    const result = await chatCompletions([
      {
        role: 'system',
        content: `You are a technology tag classifier for a code review and mentorship platform.
Given a request title and description, suggest the most relevant technology tags from this list ONLY: ${tagNames.join(', ')}.
Return a JSON array of tag names. Return only tags from the list. Return 1-5 tags max.
Respond ONLY with a raw JSON array, no markdown, no explanation.`
      },
      {
        role: 'user',
        content: `Title: ${title}\nDescription: ${description || 'No description provided'}`
      }
    ], 200);

    const content = result.choices?.[0]?.message?.content?.trim() || '[]';
    let suggestions;
    try {
      suggestions = JSON.parse(cleanJsonContent(content));
      suggestions = suggestions.filter(s => tagNames.includes(s));
    } catch {
      suggestions = [];
    }

    res.json({ suggestions });
  } catch (err) {
    console.error('AI suggest-tags error:', err.message);
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

// ──────────────────────────────────────────
// POST /api/ai/search-tags
// Body: { query }
// Returns: { tags: ["React", "PostgreSQL", ...] }
// ──────────────────────────────────────────
r.post('/search-tags', requireAuth, async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  // Fetch available tags from DB
  const { data: tags } = await supabase.from('tags').select('name').order('name');
  const tagNames = (tags || []).map(t => t.name);

  try {
    const result = await chatCompletions([
      {
        role: 'system',
        content: `You are a technology tag identifier for an engineering collaboration platform.
Given a user's search query, identify which of the following tags are relevant or requested: ${tagNames.join(', ')}.
Return a JSON array of matching tag names. Return ONLY tags that are in the provided list. If no tags match, return an empty array [].
Respond ONLY with a raw JSON array, no markdown formatting, no explanations.`
      },
      {
        role: 'user',
        content: `Search Query: "${query}"`
      }
    ], 150);

    const content = result.choices?.[0]?.message?.content?.trim() || '[]';
    let matchedTags;
    try {
      matchedTags = JSON.parse(cleanJsonContent(content));
      matchedTags = matchedTags.filter(s => tagNames.includes(s));
    } catch {
      matchedTags = [];
    }

    res.json({ tags: matchedTags });
  } catch (err) {
    console.error('AI search-tags error:', err.message);
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

// ──────────────────────────────────────────
// POST /api/ai/chat
// Body: { messages: [{ role, content }], context? }
// Returns: { reply: "..." }
// ──────────────────────────────────────────
r.post('/chat', requireAuth, async (req, res) => {
  const { messages = [], context } = req.body;
  if (!messages.length) return res.status(400).json({ error: 'Messages required' });

  const systemMsg = {
    role: 'system',
    content: `You are a helpful AI assistant embedded in the "Micro-Mentorship & Code Review Marketplace" — an internal engineering collaboration platform.

Your role:
- Help engineers and developers with code review guidance, mentorship advice, and technical questions.
- Suggest best practices for code reviews, debugging strategies, and learning paths.
- Be concise, practical, and direct. Use code examples when helpful.
- You can reference the platform's features: creating requests, claiming tasks, progress tracking.
${context ? `\nCurrent context:\n${context}` : ''}

Keep responses under 500 words unless asked for more detail.`
  };

  try {
    const result = await chatCompletions([systemMsg, ...messages.slice(-10)], 2048);
    const reply = result.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

export default r;
