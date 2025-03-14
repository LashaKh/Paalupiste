exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { status, SheetID, SheetLink, requestId } = JSON.parse(event.body);

    console.log('Callback received:', { status, SheetID, SheetLink, requestId });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Callback processed successfully',
        status,
        SheetID,
        SheetLink,
        requestId
      })
    };
  } catch (error) {
    console.error('Error processing callback:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};