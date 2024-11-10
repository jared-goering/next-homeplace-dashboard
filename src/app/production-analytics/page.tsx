"use client";

import React, { useEffect, useState } from 'react';

interface Order {
  SaleID: string;
  OrderNumber: string;
  Customer: string;
  OrderDate: string;
  Status: string;
  TotalQuantity: number;
  [key: string]: any;
}

const ProductionAnalytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/production-analytics');
        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.statusText}`);
        }
        const data = await response.json();
        setOrders(data.orders);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Production Analytics</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Production Analytics</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Production Analytics</h1>
      <p className="mb-4">List of FULFILLED Orders:</p>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Order Number</th>
            <th className="py-2 px-4 border-b">Customer</th>
            <th className="py-2 px-4 border-b">Order Date</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Total Quantity</th>
            {/* Add more headers as needed */}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.OrderNumber}>
              <td className="py-2 px-4 border-b">{order.OrderNumber}</td>
              <td className="py-2 px-4 border-b">{order.Customer}</td>
              <td className="py-2 px-4 border-b">
                {formatDate(order.OrderDate)}
              </td>
              <td className="py-2 px-4 border-b">{order.Status}</td>
              <td className="py-2 px-4 border-b">{order.TotalQuantity}</td>
              {/* Add more cells as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
}

export default ProductionAnalytics;
