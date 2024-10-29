"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import SalesList from "@/components/SalesList";
import SalesCalendar from "@/components/SalesCalendar";
import { DateRange } from "react-day-picker";
import { Sale } from "./interfaces";
import AddOrderForm from "@/components/AddOrderForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Define the RawSale interface
interface RawSale {
  OrderNumber: string;
  Customer: string;
  OrderDate: string;
  Status: string;
  InvoiceAmount: number;
  PrintDateRange?: {
    from: string;
    to?: string;
  };
  isManual?: boolean;
  isActive: boolean;
  totalQuantity?: number; // Add this line
}

interface NewOrder {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  totalQuantity: number; // Changed from InvoiceAmount to totalQuantity
  PrintDateRange?: DateRange;
}

// Utility function to determine group
function determineGroup(orderNumber: string, customerName: string, orderDate: string): string {
  const isMurdochs = customerName.includes("Murdoch");
  const isPrintavo = orderNumber.includes("Printavo");
  const date = orderDate?.substring(0, 10) ?? "Unknown Date";

  if (isMurdochs) {
    return `Murdochs - ${date}`;
  } else if (isPrintavo) {
    return `Printavo`;
  } else {
    return `NoGroup-${orderNumber}`;
  }
}

// Function to process raw sales data

function processRawSale(sale: RawSale): Sale {
  const customerName = sale.Customer ?? "";
  const group = determineGroup(sale.OrderNumber, customerName, sale.OrderDate);

  const PrintDateRange = sale.PrintDateRange?.from
    ? {
        from: new Date(sale.PrintDateRange.from),
        to: sale.PrintDateRange.to ? new Date(sale.PrintDateRange.to) : undefined,
      }
    : undefined;

  const isManual = sale.isManual ?? false;

  // Include totalQuantity from the raw sale data
  const totalQuantity = sale.totalQuantity;

  return { ...sale, group, PrintDateRange, isManual, totalQuantity };
}


export default function Home() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const timestamp = Date.now();
      const response = await axios.get(`/api/sales?cacheBust=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (Array.isArray(response.data?.SaleList)) {
        const rawSales: RawSale[] = response.data.SaleList;
        const salesData = rawSales.map(processRawSale);
        setSales(salesData);
      } else {
        console.error("Unexpected data format:", response.data);
        setSales([]);
      }
    } catch (error) {
      console.error("Error fetching sales:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = async (orderNumber: string, updatedFields: Partial<Sale>) => {
    console.log('handleFieldChange called with:', orderNumber, updatedFields);
  
    const targetSale = sales.find((sale) => sale.OrderNumber === orderNumber);
    if (!targetSale) return;
  
    const oldGroup = targetSale.group;
  
    let orderNumbersToUpdate: string[];
  
    // Determine if we need to update multiple orders or just one
    if (
      oldGroup &&
      oldGroup.startsWith("Murdochs") &&
      (updatedFields.OrderDate || updatedFields.Customer)
    ) {
      // For Murdochs group, if OrderDate or Customer changes, update all orders in the group
      orderNumbersToUpdate = sales
        .filter((sale) => sale.group === oldGroup)
        .map((sale) => sale.OrderNumber);
    } else {
      // For other fields or non-grouped orders, update only the target order
      orderNumbersToUpdate = [orderNumber];
    }
  
    const updatedSales = sales.map((sale) => {
      if (orderNumbersToUpdate.includes(sale.OrderNumber)) {
        // Create a copy of the sale object
        const updatedSale = { ...sale };
  
        // Update only specified fields
        for (const key of Object.keys(updatedFields) as (keyof Sale)[]) {
          if (updatedFields[key] !== undefined) {
            updatedSale[key] = updatedFields[key]!;
          }
        }
  
        // Recalculate group if OrderDate or Customer changed
        if (updatedFields.OrderDate || updatedFields.Customer) {
          updatedSale.group = determineGroup(
            updatedSale.OrderNumber,
            updatedSale.Customer,
            updatedSale.OrderDate
          );
        }
  
        // Log the updated sale
        console.log("Updated sale:", updatedSale);
  
        return updatedSale;
      }
      return sale;
    });
  
    // Log the updated sales array
    console.log("Updated sales array:", updatedSales);
  
    setSales(updatedSales);
  
    try {
      await Promise.all(
        orderNumbersToUpdate.map(async (orderNum) => {
          const sale = updatedSales.find((sale) => sale.OrderNumber === orderNum);
          if (!sale) return;
  
          const updatedData: Partial<Sale> = {};
  
          // Include all updated fields
          for (const key of Object.keys(updatedFields) as (keyof Sale)[]) {
            if (updatedFields[key] !== undefined) {
              updatedData[key] = updatedFields[key]!;
            }
          }
  
          // Include updated group if necessary
          if (updatedFields.OrderDate || updatedFields.Customer) {
            updatedData.group = sale.group; // Use the new group
          }
  
          console.log("Sending update for order:", sale.OrderNumber, updatedData);
  
          try {
            const response = await axios.post("/api/sales/update-order", {
              orderNumber: sale.OrderNumber,
              updatedData,
            });
            console.log(`Order ${sale.OrderNumber} updated successfully:`, response.data);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(
                `Error updating order ${sale.OrderNumber}:`,
                error.response?.data || error.message
              );
            } else {
              console.error(`Error updating order ${sale.OrderNumber}:`, error);
            }
          }
        })
      );
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  };
  
const handleDateChange = useCallback(
  async (orderNumber: string, dateRange?: DateRange): Promise<void> => {
    // Prepare data for the API
    let fromDate = dateRange?.from ? new Date(dateRange.from) : null;
    let toDate = dateRange?.to ? new Date(dateRange.to) : null;

    if (!fromDate && toDate) fromDate = toDate;
    if (fromDate && !toDate) toDate = fromDate;

    if (fromDate && isNaN(fromDate.getTime())) fromDate = null;
    if (toDate && isNaN(toDate.getTime())) toDate = null;

    const printDateRange: DateRange | null =
      fromDate && toDate
        ? {
            from: fromDate,
            to: toDate,
          }
        : null;

    const targetSale = sales.find((sale) => sale.OrderNumber === orderNumber);
    if (!targetSale) return;

    const group = targetSale.group;

    if (group?.startsWith("Murdochs")) {
      const updatedSales = sales.map((sale) => {
        if (sale.group === group) {
          const updatedSale = { ...sale };

          if (printDateRange) {
            updatedSale.PrintDateRange = printDateRange;
          }

          return updatedSale;
        }
        return sale;
      });

      setSales(updatedSales);

      try {
        await Promise.all(
          updatedSales
            .filter((sale) => sale.group === group)
            .map((sale) => {
              const updatedData: Partial<Sale> = {};
      
              if (printDateRange && printDateRange.from && printDateRange.to) {
                const printDateRangeData = {
                  from: printDateRange.from.toISOString(),
                  to: printDateRange.to.toISOString(),
                };
      
                updatedData.PrintDateRange = printDateRangeData;
              } else {
                // Optionally, if you need to clear PrintDateRange in the backend
                updatedData.PrintDateRange = undefined;
              }
      
              console.log("Updating order:", sale.OrderNumber, updatedData);
      
              return axios.post("/api/sales/update-order", {
                orderNumber: sale.OrderNumber,
                updatedData,
              });
            })
        );
      } catch (error) {
        console.error("Error updating print date range:", error);
      }
    } else {
      setSales((prevSales) =>
        prevSales.map((sale) =>
          sale.OrderNumber === orderNumber
            ? { ...sale, PrintDateRange: printDateRange || undefined }
            : sale
        )      
      );

      try {
        const updatedData: Partial<Sale> = {};

        if (printDateRange) {
          const printDateRangeData = {
            from: printDateRange.from!.toISOString(),
            to: printDateRange.to!.toISOString(),
          };

          updatedData.PrintDateRange = printDateRangeData;
        } else {
          updatedData.PrintDateRange = undefined;
        }

        console.log("Updating order:", orderNumber, updatedData);

        await axios.post("/api/sales/update-order", {
          orderNumber,
          updatedData,
        });
      } catch (error) {
        console.error("Error updating print date range:", error);
      }
    }
  },
  [sales]
);




// Update the handleAddOrder function
const handleAddOrder = async (newOrder: NewOrder) => {
  try {
    const customerName = newOrder.Customer ?? "";
    const group = determineGroup(newOrder.OrderNumber, customerName, newOrder.OrderDate);

    const newSale: Sale = {
      ...newOrder,
      isActive: true,
      isManual: true,
      group,
      totalQuantity: newOrder.totalQuantity, // Ensure totalQuantity is included
    };

    await axios.post("/api/sales/add-order", newSale);
    setSales((prevSales) => [...prevSales, newSale]);
    setIsModalOpen(false);
  } catch (error) {
    console.error("Error adding new order:", error);
  }
};

  const activeSales = useMemo(() => sales.filter((sale) => sale.isActive), [sales]);
  const completedSales = useMemo(() => sales.filter((sale) => !sale.isActive), [sales]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading sales data...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
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
          <h2 className="text-2xl font-bold mb-4">Sales Orders</h2>

          {/* Tabs */}
          <div className="flex">
            <button
              className={`flex-1 py-2 px-4 text-center rounded-t-md ${
                activeTab === "active"
                  ? "bg-white border-t border-l border-r border-gray-300"
                  : "bg-gray-200"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active Orders
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center rounded-t-md ${
                activeTab === "completed"
                  ? "bg-white border-t border-l border-r border-gray-300"
                  : "bg-gray-200"
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed Orders
            </button>
          </div>

          {/* SalesList */}
          {activeTab === "active" && (
            <SalesList
              sales={activeSales}
              setSales={setSales}
              handleDateChange={handleDateChange}
              handleFieldChange={handleFieldChange}
            />
          )}
          {activeTab === "completed" && (
            <SalesList
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
    </div>
  );
}
