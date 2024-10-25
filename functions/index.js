// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

// Helper function to fetch order detail from Cin7
async function fetchOrderDetailFromCin7(saleID) {
  const accountId = functions.config().cin7.account_id;
  const applicationKey = functions.config().cin7.application_key;

  if (!accountId || !applicationKey) {
    console.error('Missing CIN7 API credentials');
    return null;
  }

  try {
    const response = await axios.get(
      'https://inventory.dearsystems.com/ExternalApi/v2/sale/order',
      {
        params: { SaleID: saleID },
        headers: {
          'api-auth-accountid': accountId,
          'api-auth-applicationkey': applicationKey,
          Accept: 'application/json',
        },
      }
    );

    const orderDetail = response.data;

    // Extract the quantity data from orderDetail
    const totalQuantity = calculateTotalQuantity(orderDetail);

    return {
      totalQuantity,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      // Include any other detailed fields you need
    };
  } catch (error) {
    console.error(`Error fetching details for SaleID ${saleID}:`, error);
    return null;
  }
}

// Helper function to calculate total quantity from order detail
function calculateTotalQuantity(orderDetail) {
  // Assuming orderDetail has an Items array with Quantity field
  const items = orderDetail?.SaleOrder?.Lines || [];
  return items.reduce((total, item) => total + (item.Quantity || 0), 0);
}

// Scheduled function using functions.pubsub.schedule().onRun()
exports.fetchCin7OrderDetails = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const firestore = admin.firestore();

    try {
      // Fetch orders needing detailed data
      const ordersSnapshot = await firestore
        .collection('orders')
        .where('needsDetailFetch', '==', true)
        .limit(60) // Limit to 60 to respect rate limit
        .get();

      const ordersToUpdate = [];

      for (const doc of ordersSnapshot.docs) {
        const orderData = doc.data();
        const orderNumber = doc.id;
        const saleID = orderData.SaleID;

        // Fetch detailed data for each order
        const detailedData = await fetchOrderDetailFromCin7(saleID);

        if (detailedData) {
          // Update the order with detailed data
          ordersToUpdate.push({
            orderNumber,
            data: {
              ...detailedData,
              needsDetailFetch: false, // Set flag to false
            },
          });
        } else {
          console.error(`Failed to fetch details for order ${orderNumber}`);
        }
      }

      if (ordersToUpdate.length > 0) {
        // Batch update orders in Firestore
        const batch = firestore.batch();
        ordersToUpdate.forEach(({ orderNumber, data }) => {
          const orderRef = firestore.collection('orders').doc(orderNumber);
          batch.update(orderRef, data);
        });

        await batch.commit();
        console.log('Order details updated successfully.');
      } else {
        console.log('No orders to update.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  });
