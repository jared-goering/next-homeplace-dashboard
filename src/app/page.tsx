"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import SalesList from "../components/SalesList";
import SalesCalendar from "../components/SalesCalendar";
import { DateRange } from "react-day-picker";
import { Sale } from "./interfaces"; // Adjust the path as necessary
import AddOrderForm from "../components/AddOrderForm"; // Import the new component

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

export default function Home() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    console.log("Fetching sales data...");
    try {
      const response = await axios.get("/api/sales");
      console.log("Response data:", response.data);

      if (response.data && Array.isArray(response.data.SaleList)) {
        const rawSales: RawSale[] = response.data.SaleList;

        // Process the sales to add a 'group' field
        const processedSales = rawSales.map((sale: RawSale) => {
          const isMurdochs = sale.Customer.includes("Murdoch");
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

          return { ...sale, group, PrintDateRange };
        });

        setSales(processedSales);
      } else {
        console.error("Unexpected data format:", response.data);
        setSales([]);
      }

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

  const handleDateChange = React.useCallback(
    async (orderNumber: string, dateRange: DateRange | undefined) => {
      // Update the state immediately for responsiveness
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

      try {
        await axios.post("/api/sales/update-print-date", {
          orderNumber,
          printDateRange,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error updating print date range:", error.message);
        } else {
          console.error("Error updating print date range:", error);
        }
        // Optionally, handle errors and revert state changes if needed
      }
    },
    []
  );

  const handleAddOrder = async (newOrder: NewOrder) => {
    try {
      // Send the new order to the server to be saved in Firebase
      await axios.post("/api/sales/add-order", newOrder);

      // Update the sales state to include the new order
      setSales((prevSales) => [...prevSales, newOrder]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding new order:", error.message);
      } else {
        console.error("Error adding new order:", error);
      }
      // Optionally, display an error message to the user
    }
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

      {/* Add Order Form */}
      <AddOrderForm onAddOrder={handleAddOrder} />

      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3 md:pr-4">
          <SalesList sales={sales} handleDateChange={handleDateChange} />
        </div>
        <div className="md:w-1/3 md:prl-4">
          <SalesCalendar sales={sales} />
        </div>
      </div>
    </div>
  );
}