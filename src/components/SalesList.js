'use client'; // Add this line

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    console.log('Fetching sales data...');
    try {
      const response = await axios.get('/api/sales');
       console.log('Response data:', response);
  
      // Since response.data contains { Total, Page, SaleList }
      if (response.data && Array.isArray(response.data.SaleList)) {
        setSales(response.data.SaleList);
      } else {
        console.error('Unexpected data format:', response.data);
        setSales([]);
      }
  
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  return (
    <div>
      <h1>Sales Orders</h1>
      {loading ? (
        <div>Loading sales data...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              {/* Add other columns as needed */}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sales) && sales.length > 0 ? (
              sales.map((sale) => (
                sale && (
                  <tr key={sale.OrderNumber}>
                    <td>{sale.OrderNumber}</td>
                    <td>{sale.Customer}</td>
                    <td>{sale.Status}</td>
                    <td>{sale.InvoiceAmount}</td>
                    {/* Add other data as needed */}
                  </tr>
                )
              ))
            ) : (
              <tr>
                <td colSpan="4">No sales data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesList;