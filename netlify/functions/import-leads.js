const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  console.log('Import leads function received request', { 
    method: event.httpMethod,
    headers: event.headers,
  });
  
  try {
    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
      console.log('Request body parsed:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request body',
          details: parseError.message
        })
      };
    }

    const { sheetId, userId, webhookUrl, token } = body;
    
    if (!sheetId || !userId) {
      console.error('Missing required parameters:', { sheetId, userId });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters',
          missingParams: !sheetId ? 'sheetId' : 'userId'
        })
      };
    }

    // Use the provided webhook URL or fall back to the default
    const targetWebhook = webhookUrl || 'https://hook.eu2.make.com/neljqr5sqfmzh0cfagnkzdl8a9nmtr3b';
    console.log('Forwarding to webhook:', targetWebhook);
    
    try {
      // Forward the request to Make.com
      const response = await fetch(targetWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sheetId,
          userId,
          source: 'lead_generation_import',
          token: token || 'server-token' // Add token if provided or use a default one
        })
      });

      // Get response as text first for logging
      const responseText = await response.text();
      console.log('Webhook response status:', response.status);
      console.log('Webhook response text:', responseText);
      
      // Check if we received a valid response
      if (!response.ok) {
        console.error('Make.com webhook returned error:', {
          status: response.status,
          body: responseText
        });
        
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error: 'Webhook error',
            status: response.status,
            details: responseText
          })
        };
      }

      // Try to parse the response as JSON to validate it
      let responseData;
      try {
        // We already have the text response, so try to parse it
        responseData = JSON.parse(responseText);
        console.log('Response successfully parsed as JSON');
      } catch (jsonError) {
        console.log('Response is not valid JSON, returning as plain text');
        // Not JSON, just return the text as is
        return {
          statusCode: 200,
          headers,
          body: responseText
        };
      }

      // Return the parsed JSON response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responseData)
      };
    } catch (fetchError) {
      console.error('Error calling Make.com webhook:', fetchError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Error calling webhook',
          details: fetchError.message
        })
      };
    }
  } catch (error) {
    console.error('Unexpected error in import-leads function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
}; 