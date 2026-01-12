import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = req.headers.get("upgrade") || "";
  
  // Check if this is a WebSocket upgrade request
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
  
  if (!FINNHUB_API_KEY) {
    console.error('FINNHUB_API_KEY not configured');
    return new Response("Finnhub API key not configured", { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  try {
    // Upgrade the incoming request to WebSocket
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    
    // Connect to Finnhub WebSocket
    const finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
    
    let isClientOpen = true;
    let isFinnhubOpen = false;
    const pendingSubscriptions: string[] = [];

    finnhubSocket.onopen = () => {
      console.log('Connected to Finnhub WebSocket');
      isFinnhubOpen = true;
      
      // Send any pending subscriptions
      pendingSubscriptions.forEach(symbol => {
        finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
        console.log(`Subscribed to ${symbol}`);
      });
      pendingSubscriptions.length = 0;
    };

    finnhubSocket.onmessage = (event) => {
      if (isClientOpen && clientSocket.readyState === WebSocket.OPEN) {
        try {
          const data = JSON.parse(event.data);
          
          // Forward trade data to client
          if (data.type === 'trade' && data.data) {
            console.log(`Received ${data.data.length} trades`);
            clientSocket.send(event.data);
          } else if (data.type === 'ping') {
            // Keep alive
            finnhubSocket.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (err) {
          console.error('Error processing Finnhub message:', err);
        }
      }
    };

    finnhubSocket.onerror = (error) => {
      console.error('Finnhub WebSocket error:', error);
    };

    finnhubSocket.onclose = () => {
      console.log('Finnhub WebSocket closed');
      isFinnhubOpen = false;
      if (isClientOpen && clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };

    clientSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received from client:', message);
        
        if (message.type === 'subscribe' && message.symbols && Array.isArray(message.symbols)) {
          message.symbols.forEach((symbol: string) => {
            if (isFinnhubOpen) {
              finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
              console.log(`Subscribed to ${symbol}`);
            } else {
              pendingSubscriptions.push(symbol);
            }
          });
        } else if (message.type === 'unsubscribe' && message.symbols) {
          message.symbols.forEach((symbol: string) => {
            if (isFinnhubOpen) {
              finnhubSocket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
            }
          });
        }
      } catch (err) {
        console.error('Error parsing client message:', err);
      }
    };

    clientSocket.onclose = () => {
      console.log('Client WebSocket closed');
      isClientOpen = false;
      if (isFinnhubOpen) {
        finnhubSocket.close();
      }
    };

    clientSocket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
    };

    return response;
  } catch (error) {
    console.error('Error setting up WebSocket relay:', error);
    return new Response(`Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
