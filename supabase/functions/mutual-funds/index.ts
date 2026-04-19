import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MFAPI_BASE = 'https://api.mfapi.in';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'search';

    if (action === 'search') {
      const query = url.searchParams.get('q') || '';
      const response = await fetch(`${MFAPI_BASE}/mf/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'latest') {
      const schemeCode = url.searchParams.get('code');
      if (!schemeCode || !/^\d{1,10}$/.test(schemeCode)) {
        return new Response(JSON.stringify({ error: 'Invalid scheme code' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const response = await fetch(`${MFAPI_BASE}/mf/${schemeCode}/latest`);
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'history') {
      const schemeCode = url.searchParams.get('code');
      if (!schemeCode || !/^\d{1,10}$/.test(schemeCode)) {
        return new Response(JSON.stringify({ error: 'Invalid scheme code' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const response = await fetch(`${MFAPI_BASE}/mf/${schemeCode}`);
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch fetch latest NAVs for multiple schemes
    if (action === 'batch') {
      const body = await req.json();
      const codes: string[] = body.codes || [];
      
      if (codes.length === 0 || codes.length > 30) {
        return new Response(JSON.stringify({ error: 'Provide 1-30 scheme codes' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const results = await Promise.all(
        codes.map(async (code) => {
          try {
            if (!/^\d{1,10}$/.test(code)) return null;
            const res = await fetch(`${MFAPI_BASE}/mf/${code}/latest`);
            const data = await res.json();
            return { code, ...data };
          } catch {
            return null;
          }
        })
      );

      return new Response(JSON.stringify({ results: results.filter(Boolean) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch fetch full NAV history for multiple schemes (used to compute CAGR)
    if (action === 'batch-history') {
      const body = await req.json();
      const codes: string[] = body.codes || [];

      if (codes.length === 0 || codes.length > 20) {
        return new Response(JSON.stringify({ error: 'Provide 1-20 scheme codes' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const results = await Promise.all(
        codes.map(async (code) => {
          try {
            if (!/^\d{1,10}$/.test(code)) return null;
            const res = await fetch(`${MFAPI_BASE}/mf/${code}`);
            const data = await res.json();
            return { code, meta: data?.meta, data: data?.data };
          } catch {
            return null;
          }
        })
      );

      return new Response(JSON.stringify({ results: results.filter(Boolean) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in mutual-funds function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
