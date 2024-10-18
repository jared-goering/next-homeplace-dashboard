import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Status {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  visualId: string;
  status: Status;
  contact: Contact;
  total: number;
  timestamps: Timestamps;
  customerDueAt?: string; // Optional field for production due date
}

const OpenOrdersList: React.FC = () => {
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOpenOrders = async () => {
      const statusIds = ['380067', '454197', '380072', '380073', '380068', '380069', '380070', '380071']; // Include Quote, Product Ordered, Ready for Production, and In Production statuses

      const query = `
        query GetOpenOrders($statusIds: [ID!]!) {
          orders(statusIds: $statusIds) {
            nodes {
              __typename
              ... on Quote {
                id
                visualId
                status {
                  id
                  name
                }
                contact {
                  id
                  email
                  firstName
                  lastName
                }
                total
                timestamps {
                  createdAt
                  updatedAt
                }
                customerDueAt
              }
              ... on Invoice {
                id
                visualId
                status {
                  id
                  name
                }
                contact {
                  id
                  email
                  firstName
                  lastName
                }
                total
                timestamps {
                  createdAt
                  updatedAt
                }
                customerDueAt
              }
            }
          }
        }
      `;

      const variables = {
        statusIds,
      };

      try {
        console.log('Fetching open orders...');
        const response = await axios.post('/api/printavo', { query, variables });
        const data = response.data;

        if (data.errors) {
          console.error('GraphQL errors:', data.errors);
          setOpenOrders([]);
        } else {
          const orders = data.data.orders.nodes;
          setOpenOrders(orders);
        }
      } catch (error) {
        console.error('Error fetching open orders:', error);
        setOpenOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenOrders();
  }, []);

  if (loading) {
    return <div>Loading open orders...</div>;
  }

  return (
    <div>
      <h2>Open Orders</h2>
      {openOrders.length === 0 ? (
        <p>No open orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Status</th> {/* Add Status column */}
              <th>Total</th>
              <th>Production Due Date</th> {/* New column */}
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {openOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.visualId}</td>
                <td>
                  {order.contact.firstName} {order.contact.lastName}
                </td>
                <td>{order.status.name}</td> {/* Display status name */}
                <td>${order.total.toFixed(2)}</td>
                <td>
                  {order.customerDueAt ? new Date(order.customerDueAt).toLocaleDateString() : 'N/A'}
                </td> {/* Display production due date if available */}
                <td>
                  {new Date(order.timestamps.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OpenOrdersList;
