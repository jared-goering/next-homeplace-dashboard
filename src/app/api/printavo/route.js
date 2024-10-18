import axios from 'axios';

export async function POST(req) {
  try {
    // Parse request body
    const { query, variables } = await req.json();

    const headers = {
      'Content-Type': 'application/json',
      email: process.env.NEXT_PUBLIC_PRINTAVO_EMAIL,
      token: process.env.NEXT_PUBLIC_PRINTAVO_TOKEN,
    };

    console.log('Forwarding request to Printavo API', { query, variables });

    // Forward the request to the Printavo API
    const response = await axios.post(
      'https://www.printavo.com/api/v2',
      { query, variables },
      { headers }
    );

    console.log('Response from Printavo API:', response.data);

    // Return the response as a new Response object with 200 status
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Printavo Proxy:', error.message);

    // If an error occurs, return the error message as a response
    return new Response(JSON.stringify({ message: error.message, details: error.response?.data }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
