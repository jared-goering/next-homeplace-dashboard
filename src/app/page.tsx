"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import SalesList from "@/components/SalesList";
import SalesCalendar from "../components/SalesCalendar";
import { DateRange } from "react-day-picker";
import { Sale } from "./interfaces"; // Adjust the path as necessary
import AddOrderForm from "../components/AddOrderForm"; // Import the new component
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

// Define the RawSale interface
interface RawSale {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  InvoiceAmount: number;
  // Include any other properties returned by the API
  PrintDateRange?: {
    from: string;
    to?: string;
  };
}

interface NewOrder {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  InvoiceAmount: number;
  PrintDateRange?: DateRange;
}

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
  customerDueAt?: string;
}


export default function Home() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling the modal

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    console.log("Fetching sales data...");
    try {
      // Fetch manual sales data
      const response = await axios.get("/api/sales");
      console.log("Response data:", response.data);
  
      let manualSales: Sale[] = [];
      if (response.data && Array.isArray(response.data.SaleList)) {
        const rawSales: RawSale[] = response.data.SaleList;
  
        // Process the sales to add a 'group' field and ensure correct types
        manualSales = rawSales.map((sale: RawSale) => {
          console.log("Processing sale:", sale);
  
          const customerName = sale.Customer || "";
          const isMurdochs = customerName.includes("Murdoch");
  
          const date = sale.OrderDate
            ? sale.OrderDate.substring(0, 10)
            : "Unknown Date";
          const group = isMurdochs
            ? `Murdochs - ${date}`
            : `NoGroup-${sale.OrderNumber}`;
  
          // Ensure PrintDateRange dates are JavaScript Date objects
          let PrintDateRange = undefined;
          if (sale.PrintDateRange && sale.PrintDateRange.from) {
            PrintDateRange = {
              from: new Date(sale.PrintDateRange.from),
              to: sale.PrintDateRange.to
                ? new Date(sale.PrintDateRange.to)
                : undefined,
            };
          }
  
          return { ...sale, group, PrintDateRange, isManual: true };
        });
      } else {
        console.error("Unexpected data format:", response.data);
        manualSales = [];
      }
  
      // Fetch open orders from Printavo
      const openOrdersData: Order[] = await fetchOpenOrders();
      console.log("Open Orders Data:", openOrdersData);
  
      // Transform open orders into Sale objects
      const transformedOpenOrders: Sale[] = openOrdersData.map(
        transformOrderToSale
      );
  
      // Build a Map to track orders and prevent duplicates
      const salesMap = new Map();
  
      // Add manual sales to the map
      manualSales.forEach((sale) => {
        salesMap.set(sale.OrderNumber, sale);
      });
  
      // Add imported sales, skipping duplicates
      transformedOpenOrders.forEach((sale) => {
        if (!salesMap.has(sale.OrderNumber)) {
          salesMap.set(sale.OrderNumber, sale);
        } else {
          console.log(
            `Duplicate order found: ${sale.OrderNumber}. Keeping manual sale.`
          );
        }
      });
  
      // Convert the map back to an array
      const combinedSales = Array.from(salesMap.values());
  
      setSales(combinedSales);
      setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching sales:", error.message);
      } else {
        console.error("Error fetching sales:", error);
      }
      setLoading(false);
    }
  };
  
  
  

  // In your Home component
// In your Home component
const handleDateChange = useCallback(
  async (
    orderNumber: string,
    dateRange: DateRange | undefined,
    isManual: boolean
  ): Promise<void> => {
    // Update the state
    setSales((prevSales) =>
      prevSales.map((sale: Sale) => {
        if (sale.OrderNumber === orderNumber) {
          return { ...sale, PrintDateRange: dateRange };
        }
        return sale;
      })
    );

    // Prepare data for the API
    const printDateRange =
      dateRange && dateRange.from
        ? {
            from: dateRange.from.toISOString(),
            to: dateRange.to ? dateRange.to.toISOString() : null,
          }
        : null;

    if (isManual) {
      try {
        await axios.post("/api/sales/update-print-date", {
          orderNumber,
          printDateRange,
          isManual, // Include isManual flag
        });
      } catch (error) {
        console.error("Error updating print date range:", error);
      }
    } else {
      // For imported sales, store the PrintDateRange locally or handle accordingly
    }
  },
  [setSales]
);

  

  const handleAddOrder = async (newOrder: NewOrder) => {
    try {
      // Send the new order to the server to be saved in Firebase
      await axios.post("/api/sales/add-order", newOrder);

      // Update the sales state to include the new order
      setSales((prevSales) => [...prevSales, newOrder]);

      // Close the modal after adding the order
      setIsModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding new order:", error.message);
      } else {
        console.error("Error adding new order:", error);
      }
      // Optionally, display an error message to the user
    }
  };

  const handleFieldChange = async (
    orderNumber: string,
    updatedFields: Partial<Sale>
  ) => {
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.OrderNumber === orderNumber ? { ...sale, ...updatedFields } : sale
      )
    );
  
    const sale = sales.find((s) => s.OrderNumber === orderNumber);
    if (sale?.isManual) {
      try {
        await axios.post("/api/sales/update-order", {
          orderNumber,
          updatedData: updatedFields,
        });
      } catch (error) {
        console.error("Error updating order:", error);
      }
    } else {
      // Handle updates for imported sales if necessary
      // For imported sales, you might restrict editing or store updates locally
    }
  };
  

  const fetchOpenOrders = async (): Promise<Order[]> => {
    const statusIds = [
      "380067",
      "454197",
      "380072",
      "380073",
      "380068",
      "380069",
      "380070",
      "380071",
    ];
  
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
      const response = await axios.post("/api/printavo", { query, variables });
      const data = response.data;
  
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        return [];
      } else {
        return data.data.orders.nodes;
      }
    } catch (error) {
      console.error("Error fetching open orders:", error);
      return [];
    }
  };

  const transformOrderToSale = (order: Order): Sale => {
    return {
      OrderNumber: `Printavo-${order.visualId}`, // Prefix to ensure uniqueness
      Customer: `${order.contact.firstName} ${order.contact.lastName}`.trim(),
      OrderDate: order.timestamps.createdAt,
      Status: order.status.name,
      PrintDateRange: order.customerDueAt
        ? {
            from: new Date(order.customerDueAt),
            to: new Date(order.customerDueAt),
          }
        : undefined,
      InvoiceAmount: order.total,
      group: `Printavo`, // Or any grouping logic you prefer
      isManual: false, // Indicate that this is an imported order
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">Loading sales data...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <h1 className="text-3xl font-bold mb-4">Homeplace Mission Control 🚀</h1>

      {/* Add Order Button */}
      <Button onClick={() => setIsModalOpen(true)} className="mb-4">
        + Add New Order
      </Button>

      {/* Add Order Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
          </DialogHeader>
          <AddOrderForm onAddOrder={handleAddOrder} />
          <DialogClose asChild>
            <Button className="mt-4" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3 md:pr-4">
        <SalesList
          sales={sales}
          setSales={setSales}
          handleDateChange={handleDateChange}
          handleFieldChange={handleFieldChange}
        />
        </div>
        <div className="md:w-1/3 md:prl-4">
          <SalesCalendar sales={sales} />
        </div>

      </div>
    </div>
  );
}