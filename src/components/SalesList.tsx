// components/SalesList.tsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { DataTable } from "@/components/DataTable"; // Adjust the import path as necessary
import { ColumnDef, flexRender } from "@tanstack/react-table";

interface Sale {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  InvoiceAmount: number;
  // Add other fields as necessary
  group?: string; // Added group as optional
}

const SalesList = () => {
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
        const rawSales = response.data.SaleList;

        // Process the sales to add a 'group' field
        const processedSales = rawSales.map((sale: Sale) => {
          const isMurdochs = sale.Customer.includes("Murdoch");
          const date = sale.OrderDate ? sale.OrderDate.substring(0, 10) : "Unknown Date";
          if (isMurdochs) {
            // For Murdochs sales, group by 'Murdochs - date'
            return { ...sale, group: `Murdochs - ${date}` };
          } else {
            // For non-Murdochs sales, set 'group' to a unique value to prevent grouping
            return { ...sale, group: `NoGroup-${sale.OrderNumber}` };
          }
        });

        setSales(processedSales);
      } else {
        console.error("Unexpected data format:", response.data);
        setSales([]);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching sales:", error.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
  };

  const columns: ColumnDef<Sale, any>[] = useMemo(
    () => [
      {
        accessorKey: "group",
        header: "Group",
        enableGrouping: true,
        cell: ({ cell, row, getValue }) => {
          if (row.getIsGrouped()) {
            if (row.subRows.length > 1) {
              const groupValue = getValue<string>(); // This is the 'group' field value
              let groupLabel = "";
              if (groupValue.startsWith("Murdochs - ")) {
                const datePart = groupValue.replace("Murdochs - ", "");
                groupLabel = `Murdochs (${formatDate(datePart)})`;
              } else {
                // Handle other group labels if necessary
                groupLabel = groupValue;
              }

              return (
                <span
                  onClick={row.getToggleExpandedHandler()}
                  style={{ cursor: "pointer" }}
                >
                  {row.getIsExpanded() ? "➖" : "➕"} {groupLabel} ({row.subRows.length})
                </span>
              );
            } else {
              // For groups with only one row, render nothing (the sub-row will display data)
              return null;
            }
          } else {
            // For regular rows, display the order date
            return formatDate(row.original.OrderDate);
          }
        },
      },
      {
        accessorKey: "OrderNumber",
        header: "Order #",
      },
      {
        accessorKey: "Customer",
        header: "Customer",
      },
      {
        accessorKey: "OrderDate",
        header: "Order Date",
        cell: ({ cell, getValue }) => {
          if (cell.getIsAggregated()) {
            // If the cell is aggregated, we can return a summary or leave it empty
            return null;
          } else if (cell.getIsPlaceholder()) {
            // If the cell is a placeholder, render nothing
            return null;
          } else {
            // Regular cells with actual data
            return formatDate(getValue<string>());
          }
        },
        sortingFn: "datetime",
      },
      {
        accessorKey: "Status",
        header: "Status",
      },
      {
        accessorKey: "InvoiceAmount",
        header: "Invoice Amount",
        cell: ({ getValue }) =>
          getValue<number>() !== null && getValue<number>() !== undefined
            ? `$${getValue<number>().toFixed(2)}`
            : "N/A",
        sortingFn: "basic",
      },
    ],
    []
  );

  if (loading) {
    return <div className="container mx-auto p-4">Loading sales data...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Orders</h1>
      <DataTable columns={columns} data={sales} initialGrouping={['group']} />
    </div>
  );
};

export default SalesList;