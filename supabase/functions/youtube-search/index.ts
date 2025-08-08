import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, preferences, maxResults = 10 } = await req.json();
    
    console.log('YouTube search request:', { query, preferences, maxResults });

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Build search query based on preferences
    let searchQuery = query;
    if (preferences?.categories?.length > 0) {
      searchQuery += ' ' + preferences.categories.join(' OR ');
    }
    if (preferences?.customTopics) {
      searchQuery += ' ' + preferences.customTopics;
    }

    // YouTube Data API search
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', searchQuery);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('maxResults', maxResults.toString());
    searchUrl.searchParams.append('order', 'relevance');
    searchUrl.searchParams.append('key', YOUTUBE_API_KEY);

    // Include all video durations by default for variety
    // Don't filter by duration to get diverse content

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchData.error?.message}`);
    }

    // Get video details for duration, view count, etc.
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.append('part', 'statistics,contentDetails');
    detailsUrl.searchParams.append('id', videoIds);
    detailsUrl.searchParams.append('key', YOUTUBE_API_KEY);

    const detailsResponse = await fetch(detailsUrl.toString());
    const detailsData = await detailsResponse.json();

    // Combine search results with video details
    const enhancedVideos = searchData.items.map((item: any, index: number) => {
      const details = detailsData.items?.[index];
      const duration = details?.contentDetails?.duration || 'PT0S';
      
      // Convert ISO 8601 duration to readable format
      const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(durationMatch?.[1] || '0');
      const minutes = parseInt(durationMatch?.[2] || '0');
      const seconds = parseInt(durationMatch?.[3] || '0');
      
      let formattedDuration = '';
      if (hours > 0) formattedDuration += `${hours}:`;
      formattedDuration += `${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:`;
      formattedDuration += `${seconds.toString().padStart(2, '0')}`;

      // Format view count
      const viewCount = parseInt(details?.statistics?.viewCount || '0');
      const formattedViews = viewCount > 1000000 
        ? `${(viewCount / 1000000).toFixed(1)}M`
        : viewCount > 1000
        ? `${(viewCount / 1000).toFixed(1)}K`
        : viewCount.toString();

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        duration: formattedDuration,
        views: formattedViews,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description
      };
    });

    console.log(`Found ${enhancedVideos.length} videos for query: ${searchQuery}`);

    return new Response(JSON.stringify({ 
      videos: enhancedVideos,
      query: searchQuery 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      videos: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});