"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import SalesList from "@/components/SalesList";
import SalesCalendar from "../components/SalesCalendar";
import { DateRange } from "react-day-picker";
import { Sale } from "./interfaces"; // Adjust the path as necessary
import AddOrderForm from "../components/AddOrderForm"; // Import the new component
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Define the RawSale interface
interface RawSale {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  InvoiceAmount: number;
  PrintDateRange?: {
    from: string;
    to?: string;
  };
  isManual?: boolean;
  isActive: boolean; // Add this line
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');


  useEffect(() => {
    fetchSales();
  }, []);
  const fetchSales = async () => {
    console.log("Fetching sales data...");
    try {
      // Generate a unique timestamp to bypass caching
      const timestamp = Date.now();
  
      // Fetch all sales data from the server
      const response = await axios.get(`/api/sales?cacheBust=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
  
      console.log("Response data:", response.data);
  
      let salesData: Sale[] = [];
      if (response.data && Array.isArray(response.data.SaleList)) {
        const rawSales: RawSale[] = response.data.SaleList;
  
        // Process the sales to add a 'group' field and ensure correct types
        salesData = rawSales.map((sale: RawSale) => {
          console.log("Processing sale:", sale);
  
          const customerName = sale.Customer || "";
          console.log("Customer name:", sale.OrderNumber);
          const isMurdochs = customerName.includes("Murdoch");
          const isPrintavo = sale.OrderNumber.includes("Printavo");
  
          const date = sale.OrderDate
            ? sale.OrderDate.substring(0, 10)
            : "Unknown Date";
  
          let group;
  
          if (isMurdochs) {
            group = `Murdochs - ${date}`;
          } else if (isPrintavo) {
            group = `Printavo`;
          } else {
            group = `NoGroup-${sale.OrderNumber}`;
          }
          // console.log("Group:", group);
  
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
  
          // Keep the isManual flag as is, default to false if undefined
          const isManual = sale.isManual || false;

          // console.log("salesData:", sale);
  
          return { ...sale, group, PrintDateRange, isManual };
        });
      } else {
        console.error("Unexpected data format:", response.data);
        salesData = [];
      }
  
      // Set the sales state
      setSales(salesData);
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
  

  // Updated handleFieldChange function
  const handleFieldChange = async (
    orderNumber: string,
    updatedSale: Sale
  ) => {
    // Update the state with the entire updated sale
    setSales((prevSales) =>
      prevSales.map((sale) =>
        sale.OrderNumber === orderNumber ? updatedSale : sale
      )
    );

    try {
      await axios.post("/api/sales/update-order", {
        orderNumber,
        updatedData: updatedSale,
      });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Updated handleDateChange function
  const handleDateChange = useCallback(
    async (
      orderNumber: string,
      dateRange: DateRange | undefined
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
      let fromDate = dateRange && dateRange.from ? new Date(dateRange.from) : null;
      let toDate = dateRange && dateRange.to ? new Date(dateRange.to) : null;

      // If only one date is selected, set both fromDate and toDate to that date
      if (!fromDate && toDate) {
        fromDate = toDate;
      }
      if (fromDate && !toDate) {
        toDate = fromDate;
      }

      // Ensure dates are valid
      fromDate = fromDate && !isNaN(fromDate.getTime()) ? fromDate : null;
      toDate = toDate && !isNaN(toDate.getTime()) ? toDate : null;

      // Log dates for debugging
      console.log("fromDate:", fromDate);
      console.log("toDate:", toDate);

      const printDateRange =
        fromDate && toDate
          ? {
              from: fromDate.toISOString(),
              to: toDate.toISOString(),
            }
          : null;

      console.log("printDateRange:", printDateRange);

      try {
        // Update the order in the backend
        await axios.post("/api/sales/update-order", {
          orderNumber,
          updatedData: { PrintDateRange: printDateRange },
        });
      } catch (error) {
        console.error("Error updating print date range:", error);
      }
    },
    [setSales, sales]
  );

  const handleAddOrder = async (newOrder: NewOrder) => {
    try {
      // Determine 'group' for the new order
      const customerName = newOrder.Customer || "";
      const isMurdochs = customerName.includes("Murdoch");
      const isPrintavo = newOrder.OrderNumber.includes("Printavo");
      const date = newOrder.OrderDate ? newOrder.OrderDate.substring(0, 10) : "Unknown Date";
  
      let group;
      if (isMurdochs) {
        group = `Murdochs - ${date}`;
      } else if (isPrintavo) {
        group = `Printavo`;
      } else {
        group = `NoGroup-${newOrder.OrderNumber}`;
      }
  
      // Create a new Sale object with all required fields
      const newSale: Sale = {
        ...newOrder,
        isActive: true,
        isManual: true,
        group,
      };
  
      // Send the new sale to the server to be saved in Firebase
      await axios.post("/api/sales/add-order", newSale);
  
      // Update the sales state to include the new sale
      setSales((prevSales) => [...prevSales, newSale]);
  
      // Close the modal after adding the order
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding new order:", error);
      // Optionally, display an error message to the user
    }
  };
  


  // Filter active and completed sales
  const activeSales = useMemo(
    () => sales.filter((sale) => sale.isActive),
    [sales]
  );

  const dummyOrder: Sale = {
  OrderNumber: "Dummy-001",
  Customer: "Test Customer",
  OrderDate: new Date().toISOString(),
  Status: "Completed",
  InvoiceAmount: 0,
  PrintDateRange: undefined,
  isActive: false,
  isManual: true,
  group: "Test Group",
};

  const completedSales = useMemo(
    () => sales.filter((sale) => !sale.isActive),
    [sales]
  );



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


      {/* Tabs and SalesList Container */}
      <div className="flex flex-col md:flex-row">
        {/* Tabs Section */}
        <div className="md:w-2/3 md:pr-4">
        <h1 className="text-2xl font-bold mb-4">Sales Orders</h1>

          {/* Tabs */}
          <div className="flex">
          <button
            className={`tab flex-1 py-2 px-4 text-center rounded-t-md ${
              activeTab === 'active'
                ? 'bg-white border-t border-l border-r border-gray-300'
                : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active Orders
          </button>
          <button
            className={`tab flex-1 py-2 px-4 text-center rounded-t-md ${
              activeTab === 'completed'
                ? 'bg-white border-t border-l border-r border-gray-300'
                : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Orders
          </button>
        </div>

          {/* SalesList */}
          {activeTab === 'active' && (
            <SalesList
              key="active"
              sales={activeSales}
              setSales={setSales}
              handleDateChange={handleDateChange}
              handleFieldChange={handleFieldChange}
            />
          )}
          {activeTab === 'completed' && (
            <SalesList
              key="completed"
              sales={completedSales}
              setSales={setSales}
              handleDateChange={handleDateChange}
              handleFieldChange={handleFieldChange}
            />
          )}
        </div>
        <div className="md:w-1/3 md:pl-4 flex-shrink-0">
        <SalesCalendar sales={sales} />
        </div>
      </div>
   
      <style jsx>{`
        .container {
          max-width: 1200px;
        }
        @media (min-width: 768px) {
          .tabs {
            display: flex;
          }
          .tab {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
