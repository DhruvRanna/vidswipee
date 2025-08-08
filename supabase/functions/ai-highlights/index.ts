import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, channel } = await req.json();
    
    console.log('Generating highlights for:', title);

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
You are an AI that creates engaging bullet-point highlights for YouTube videos. Based on the video title, description, and channel name, create exactly 3 compelling bullet points that would make someone want to watch this video.

Video Title: ${title}
Channel: ${channel}
Description: ${description || 'No description available'}

Requirements:
- Exactly 3 bullet points
- Each point should be 8-15 words
- Focus on key insights, benefits, or interesting facts
- Make them compelling and curiosity-inducing
- Avoid generic statements
- Format as a simple list without bullet symbols

Example format:
Revolutionary AI breakthrough increases productivity by 300%
Secret technique used by top performers worldwide
Behind-the-scenes look at industry-changing innovations
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
          { role: 'system', content: 'You are an expert at creating compelling video highlights that drive engagement.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message}`);
    }

    const highlightsText = data.choices[0].message.content.trim();
    const highlights = highlightsText
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 3); // Ensure exactly 3 highlights

    console.log('Generated highlights:', highlights);

    return new Response(JSON.stringify({ 
      highlights,
      title 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-highlights function:', error);
    
    // Fallback highlights if AI fails
    const fallbackHighlights = [
      "Discover key insights from industry experts",
      "Learn practical tips you can apply immediately", 
      "Get behind-the-scenes knowledge and strategies"
    ];

    return new Response(JSON.stringify({ 
      highlights: fallbackHighlights,
      error: error.message 
    }), {
      status: 200, // Return 200 with fallback content
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});