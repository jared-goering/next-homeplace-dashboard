// app/api/production-analytics/order-detail/route.js

export const runtime = 'nodejs';

import axios from 'axios';
import Bottleneck from 'bottleneck';

// Initialize Bottleneck limiter
const limiter = new Bottleneck({
  minTime: 1000, // Wait at least 1000ms between each call
  maxConcurrent: 1, // Only 1 concurrent call at a time
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const saleID = searchParams.get('SaleID');

    if (!saleID) {
      return new Response(
        JSON.stringify({ error: 'SaleID parameter is required' }),
        { status: 400 }
      );
    }

    // Use the limited function to respect rate limits
    const orderDetail = await limitedFetchOrderDetailFromCin7(saleID);

    if (orderDetail) {
      const totalQuantity = calculateTotalQuantity(orderDetail);

      return new Response(
        JSON.stringify({ TotalQuantity: totalQuantity }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order details' }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return new Response(
      JSON.stringify({ error: 'Error fetching order detail' }),
      { status: 500 }
    );
  }
}

// Wrap the fetchOrderDetailFromCin7 function
const limitedFetchOrderDetailFromCin7 = limiter.wrap(
  fetchOrderDetailFromCin7
);

// Helper function to fetch order detail from Cin7
async function fetchOrderDetailFromCin7(saleID) {
  const accountId = process.env.CIN7_ACCOUNT_ID;
  const applicationKey = process.env.CIN7_APPLICATION_KEY;

  if (!accountId || !applicationKey) {
    console.error('Missing CIN7 API credentials');
    return null;
  }

  try {
    const response = await axios.get(
      'https://inventory.dearsystems.com/ExternalApi/v2/sale',
      {
        params: { ID: saleID },
        headers: {
          'api-auth-accountid': accountId,
          'api-auth-applicationkey': applicationKey,
          Accept: 'application/json',
        },
      }
    );

    const orderDetail = response.data;
    return orderDetail;
  } catch (error) {
    console.error(`Error fetching details for SaleID ${saleID}:`, error);
    return null;
  }
}

// Helper function to calculate total quantity from order detail
function calculateTotalQuantity(orderDetail) {
    if (!orderDetail || !orderDetail.Order || !Array.isArray(orderDetail.Order.Lines)) {
      console.warn('Invalid order detail structure:', orderDetail);
      return 0; // Return 0 if structure is unexpected
    }
  
    // Extract quantity from each line item
    const items = orderDetail.Order.Lines;
    const totalQuantity = items.reduce((total, item) => {
      // Use 0 as default if Quantity is undefined
      return total + (item.Quantity || 0);
    }, 0);
  
    return totalQuantity;
  }
  