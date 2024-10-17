// components/SalesList.tsx

"use client";

import React, { useMemo } from "react";
import { DataTable } from "@/components/DataTable"; // Adjust the import path as necessary
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import { DateRange } from "react-day-picker";
import { Sale } from "../app/interfaces"; // Adjust the path as necessary



interface SalesListProps {
  sales: Sale[];
  handleDateChange: (orderNumber: string, dateRange: DateRange | undefined) => void;
}


const SalesList: React.FC<SalesListProps> = ({ sales, handleDateChange }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(
      new Date(dateString)
    );
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
                  {row.getIsExpanded() ? "➖" : "➕"} {groupLabel} (
                  {row.subRows.length})
                </span>
              );
            } else {
              // For groups with only one row, render nothing
              return null;
            }
          } else {
            // For regular rows, leave the cell empty or display something if desired
            return null;
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
          if (cell.getIsAggregated() || cell.getIsPlaceholder()) {
            return null;
          } else {
            return formatDate(getValue<string>());
          }
        },
        sortingFn: "datetime",
      },
      {
        accessorKey: "Status",
        header: "Status",
      },
      // {
      //   accessorKey: "InvoiceAmount",
      //   header: "Invoice Amount",
      //   cell: ({ getValue }) =>
      //     getValue<number>() !== null && getValue<number>() !== undefined
      //       ? `$${getValue<number>().toFixed(2)}`
      //       : "N/A",
      //   sortingFn: "basic",
      // },
      {
        accessorKey: "PrintDates",
        header: "Print Dates",
        cell: ({ row }) => {
          const sale = row.original;

          return (
            <DatePicker
              dateRange={sale.PrintDateRange}
              onDateChange={(dateRange) =>
                handleDateChange(sale.OrderNumber, dateRange)
              }
              placeholder="Select date range"
            />
          );
        },
      },
    ],
    [handleDateChange]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Orders</h1>
      <DataTable columns={columns} data={sales} initialGrouping={["group"]} />
    </div>
  );
};

export default SalesList;