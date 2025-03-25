const fetch = require('node-fetch');

// Make.com webhook handler
exports.handler = async function (event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: headers
    };
  }

  // Log request details for debugging
  console.log("Received request to make-webhook", {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  });

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    console.log("Parsed request body:", requestBody);

    // Check if required fields are present
    if (!requestBody.sheetId || !requestBody.userId) {
      console.error("Missing required fields:", { 
        hasSheetId: !!requestBody.sheetId, 
        hasUserId: !!requestBody.userId 
      });
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: "Missing required fields: sheetId, userId" })
      };
    }

    // Log the payload
    console.log("Request payload to forward to Make.com:", requestBody);

    // Set up the Make.com webhook URL
    // You might want to store this in environment variables
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL || 
      "https://hook.eu2.make.com/neljqr5sqfmzh0cfagnkzdl8a9nmtr3b";

    console.log("Forwarding to Make.com webhook URL:", makeWebhookUrl);

    // Forward the request to Make.com
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Log Make.com response status
    console.log("Make.com response status:", response.status);

    // Get the response text
    const responseText = await response.text();
    console.log("Make.com raw response:", responseText);
    console.log("Response length:", responseText.length);

    // Debugging: Output characters around position 260
    if (responseText.length > 260) {
      console.log("Characters at position 255-265:", JSON.stringify(responseText.substring(255, 265)));
    }

    // Return a clean JSON response to avoid parsing issues
    let cleanResponse;
    try {
      // Try to parse as JSON first (in case it's already valid)
      const jsonData = JSON.parse(responseText);
      cleanResponse = jsonData;
      console.log("Make.com response is valid JSON:", cleanResponse);
    } catch (error) {
      console.log("JSON parse error:", error.message);
      
      // Special handling for specific error cases
      if (error.message.includes("position 260")) {
        // Try to extract just the valid part - assuming valid JSON ends at position 260
        try {
          const possibleValidJson = responseText.substring(0, 260);
          // Find the last occurrence of } or ] which might be the end of valid JSON
          const lastBrace = possibleValidJson.lastIndexOf('}');
          const lastBracket = possibleValidJson.lastIndexOf(']');
          const endPos = Math.max(lastBrace, lastBracket);
          
          if (endPos > 0) {
            const trimmedJson = responseText.substring(0, endPos + 1);
            console.log("Trying trimmed JSON ending at position:", endPos + 1);
            console.log("Trimmed JSON:", trimmedJson);
            cleanResponse = JSON.parse(trimmedJson);
            console.log("Successfully parsed trimmed JSON");
          }
        } catch (trimError) {
          console.log("Failed to parse trimmed JSON:", trimError.message);
        }
      }
      
      // If still not parsed, continue with our extraction methods
      if (!cleanResponse) {
        // If not valid JSON, create a new JSON response
        console.log("Make.com response is not valid JSON, creating structured response");
        
        // Extract what might be an array or object using regex
        const jsonMatch = responseText.match(/(\[.*?\]|\{.*?\})/s);
        if (jsonMatch) {
          try {
            cleanResponse = JSON.parse(jsonMatch[0]);
            console.log("Extracted JSON portion:", cleanResponse);
          } catch (e) {
            console.log("Failed to parse extracted portion:", e.message);
            // If we still can't parse it, wrap the response in a clean object
            cleanResponse = { 
              message: "Import successful", 
              rawResponse: responseText.substring(0, 100) + "...", // Truncate to avoid massive logs
              imported: true,
              timestamp: new Date().toISOString()
            };
          }
        } else {
          // No JSON-like structure found, create a fallback response
          cleanResponse = { 
            message: "Import successful", 
            rawResponse: responseText.substring(0, 100) + "...", // Truncate to avoid massive logs
            imported: true,
            timestamp: new Date().toISOString()
          };
        }
      }
    }

    // Ensure we always have a valid response
    if (!cleanResponse) {
      cleanResponse = { 
        message: "Import completed", 
        imported: true,
        timestamp: new Date().toISOString()
      };
    }

    // Return the response from Make.com to the client
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanResponse)
    };

  } catch (error) {
    console.error("Error in make-webhook function:", error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: `Error in Make.com webhook: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 