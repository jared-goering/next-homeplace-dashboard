import axios from 'axios';

export async function GET(req) {
  try {
    const limit = 500; // Max limit
    const page = 1;

    const response = await axios.get('https://inventory.dearsystems.com/ExternalApi/v2/saleList?STATUS=PACKED', {
      params: { Page: page, Limit: limit },
      headers: {
        'api-auth-accountid': process.env.CIN7_ACCOUNT_ID,
        'api-auth-applicationkey': process.env.CIN7_APPLICATION_KEY,
        'Accept': 'application/json',
      },
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching sales data:', error.message);
    return new Response(
      JSON.stringify({ error: 'Error fetching sales data' }),
      { status: 500 }
    );
  }
}