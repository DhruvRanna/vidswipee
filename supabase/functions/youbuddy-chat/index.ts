import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let message: string = '';
  let preferences: any = null;
  try {
    const body = await req.json();
    message = body.message;
    preferences = body.preferences;
    
    console.log('YouBuddy chat request:', message);

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      if (GEMINI_API_KEY) {
        try {
          const geminiBody = {
            contents: [
              { role: "user", parts: [{ text: message }] }
            ],
            systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
          };
          const gemResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody),
          });
          const gemData = await gemResponse.json();
          const reply =
            gemData?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join(' ').trim() ||
            gemData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "I'm here to help you discover great videos!";
          const isVideoRequest = message.toLowerCase().includes('video') || 
                                 message.toLowerCase().includes('watch') ||
                                 message.toLowerCase().includes('find') ||
                                 message.toLowerCase().includes('show');
          let suggestedSearchTerms = null;
          if (isVideoRequest && YOUTUBE_API_KEY) {
            const searchTerms = extractSearchTerms(message, preferences);
            if (searchTerms) suggestedSearchTerms = searchTerms;
          }
          return new Response(JSON.stringify({
            reply,
            suggestedSearchTerms,
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (e) {
          console.error('Gemini fallback failed:', e);
        }
      }
      return new Response(JSON.stringify({ 
        reply: "I'm currently offline for maintenance. Please try the video search features in the meantime!",
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // System prompt for YouBuddy
    const systemPrompt = `
You are YouBuddy, an AI assistant for YouSwipe - a YouTube video discovery app. Your job is to help users find specific YouTube videos based on their requests.

User's Preferences:
- Interested categories: ${preferences?.categories?.join(', ') || 'Not specified'}
- Custom topics: ${preferences?.customTopics || 'None'}
- Preferred video lengths: ${preferences?.videoLengths?.join(', ') || 'Any'}
- Languages: ${preferences?.languages?.join(', ') || 'Any'}
- Current mood: ${preferences?.mood || 'Not specified'}

Guidelines:
1. When users ask for video recommendations, suggest specific search terms that would find relevant content
2. Be conversational, friendly, and enthusiastic about video discovery
3. Consider their preferences when making suggestions
4. If they ask vague questions, ask clarifying questions to better understand their needs
5. Keep responses concise but helpful
6. Always focus on helping them find great YouTube content

Respond in a helpful, enthusiastic way that makes video discovery fun!
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message}`);
    }

    const reply = data.choices[0].message.content.trim();

    // If the message seems to be asking for specific videos, also suggest search terms
    const isVideoRequest = message.toLowerCase().includes('video') || 
                          message.toLowerCase().includes('watch') ||
                          message.toLowerCase().includes('find') ||
                          message.toLowerCase().includes('show');

    let suggestedSearchTerms = null;
    if (isVideoRequest && YOUTUBE_API_KEY) {
      // Extract key terms for search
      const searchTerms = extractSearchTerms(message, preferences);
      if (searchTerms) {
        suggestedSearchTerms = searchTerms;
      }
    }

    console.log('YouBuddy response generated');

    return new Response(JSON.stringify({ 
      reply,
      suggestedSearchTerms,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in youbuddy-chat function:', error);

    // Try Gemini fallback if available
    try {
      if (GEMINI_API_KEY && message) {
        const geminiBody = {
          contents: [
            { role: "user", parts: [{ text: message }] }
          ],
          systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
        };

        const gemResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody),
        });

        if (gemResponse.ok) {
          const gemData = await gemResponse.json();
          const reply =
            gemData?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join(' ').trim() ||
            gemData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "I'm here to help you discover great videos!";

          const isVideoRequest = message.toLowerCase().includes('video') || 
                                 message.toLowerCase().includes('watch') ||
                                 message.toLowerCase().includes('find') ||
                                 message.toLowerCase().includes('show');

          let suggestedSearchTerms = null;
          if (isVideoRequest && YOUTUBE_API_KEY) {
            const searchTerms = extractSearchTerms(message, preferences);
            if (searchTerms) suggestedSearchTerms = searchTerms;
          }

          return new Response(JSON.stringify({
            reply,
            suggestedSearchTerms,
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const err = await gemResponse.text();
          console.error('Gemini error:', err);
        }
      }
    } catch (e) {
      console.error('Gemini fallback failed:', e);
    }

    // Fallback: still respond helpfully without failing the request
    const fallbackTerms = extractSearchTerms(message || '', preferences);
    const fallbackReply = fallbackTerms
      ? `I'm having a small hiccup connecting right now. Try searching: "${fallbackTerms}".`
      : `I'm having a small hiccup connecting right now. Tell me what you want to watch and I'll suggest searches.`;

    return new Response(
      JSON.stringify({
        reply: fallbackReply,
        suggestedSearchTerms: fallbackTerms,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractSearchTerms(message: string, preferences: any): string | null {
  // Simple keyword extraction for YouTube search
  const keywords = message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'how', 'video', 'find', 'show', 'watch'].includes(word));

  if (keywords.length === 0) return null;

  // Combine with user preferences
  let searchTerms = keywords.slice(0, 3).join(' ');
  
  if (preferences?.categories?.length > 0) {
    const relevantCategory = preferences.categories[0];
    searchTerms += ` ${relevantCategory}`;
  }

  return searchTerms;
}