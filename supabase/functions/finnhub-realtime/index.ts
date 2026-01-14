import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_SYMBOLS_PER_MESSAGE = 50;
const MAX_TOTAL_SUBSCRIPTIONS = 100;
const SYMBOL_PATTERN = /^[A-Z0-9:.]{1,30}$/;

// Validate symbol format
const validateSymbol = (symbol: unknown): string | null => {
  if (typeof symbol !== 'string') return null;
  const trimmed = symbol.trim().toUpperCase();
  if (!SYMBOL_PATTERN.test(trimmed)) return null;
  return trimmed;
};

// Validate message structure
const validateMessage = (data: unknown): { type: string; symbols?: string[] } | null => {
  if (!data || typeof data !== 'object') return null;
  
  const message = data as Record<string, unknown>;
  
  // Validate type field
  if (typeof message.type !== 'string') return null;
  const type = message.type.trim().toLowerCase();
  
  // Only allow subscribe and unsubscribe types
  if (type !== 'subscribe' && type !== 'unsubscribe') return null;
  
  // Validate symbols array if present
  if (message.symbols !== undefined) {
    if (!Array.isArray(message.symbols)) return null;
    if (message.symbols.length > MAX_SYMBOLS_PER_MESSAGE) {
      console.warn(`Too many symbols in message: ${message.symbols.length}, max: ${MAX_SYMBOLS_PER_MESSAGE}`);
      return null;
    }
    
    const validSymbols: string[] = [];
    for (const symbol of message.symbols) {
      const validated = validateSymbol(symbol);
      if (validated) {
        validSymbols.push(validated);
      } else {
        console.warn(`Invalid symbol rejected: ${JSON.stringify(symbol).slice(0, 30)}`);
      }
    }
    
    return { type, symbols: validSymbols };
  }
  
  return { type };
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
    return new Response("Service configuration error", { 
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
    const activeSubscriptions = new Set<string>();

    finnhubSocket.onopen = () => {
      console.log('Connected to Finnhub WebSocket');
      isFinnhubOpen = true;
      
      // Send any pending subscriptions
      pendingSubscriptions.forEach(symbol => {
        if (activeSubscriptions.size < MAX_TOTAL_SUBSCRIPTIONS) {
          finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
          activeSubscriptions.add(symbol);
          console.log(`Subscribed to ${symbol}`);
        }
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
        let rawMessage: unknown;
        try {
          rawMessage = JSON.parse(event.data);
        } catch {
          console.warn('Invalid JSON received from client');
          return;
        }
        
        // Validate message structure
        const message = validateMessage(rawMessage);
        if (!message) {
          console.warn('Invalid message structure rejected');
          return;
        }
        
        console.log('Validated client message:', message.type, message.symbols?.length ?? 0, 'symbols');
        
        if (message.type === 'subscribe' && message.symbols) {
          for (const symbol of message.symbols) {
            // Check subscription limit
            if (activeSubscriptions.size >= MAX_TOTAL_SUBSCRIPTIONS) {
              console.warn(`Max subscriptions reached (${MAX_TOTAL_SUBSCRIPTIONS}), ignoring further subscribes`);
              break;
            }
            
            if (isFinnhubOpen) {
              finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
              activeSubscriptions.add(symbol);
              console.log(`Subscribed to ${symbol}`);
            } else {
              if (pendingSubscriptions.length < MAX_TOTAL_SUBSCRIPTIONS) {
                pendingSubscriptions.push(symbol);
              }
            }
          }
        } else if (message.type === 'unsubscribe' && message.symbols) {
          for (const symbol of message.symbols) {
            if (isFinnhubOpen) {
              finnhubSocket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
              activeSubscriptions.delete(symbol);
              console.log(`Unsubscribed from ${symbol}`);
            }
          }
        }
      } catch (err) {
        console.error('Error handling client message:', err);
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
    return new Response("Internal server error", { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
