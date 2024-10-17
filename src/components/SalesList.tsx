// components/SalesList.tsx

"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { Sale } from "../app/interfaces";
import axios from "axios";
import { Row } from "@tanstack/react-table"; // Add this import if not already present


interface SalesListProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  handleDateChange: (
    orderNumber: string,
    dateRange: DateRange | undefined,
    isManual: boolean
  ) => Promise<void>;
  handleFieldChange: (orderNumber: string, updatedSale: Partial<Sale>) => void;
}


const SalesList: React.FC<SalesListProps> = ({
  sales,
  setSales, // Add this line
  handleDateChange,
  handleFieldChange,
}) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const editedFieldsRef = useRef<{ [key: string]: Partial<Sale> }>({});
  const [editedFields, setEditedFields] = useState<{
    [key: string]: Partial<Sale>;
  }>({});

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(
      new Date(dateString)
    );
  }, []);

  const handleEdit = useCallback((orderNumber: string) => {
    setEditingRow(orderNumber);
    editedFieldsRef.current = {};
  }, []);

  const handleCancel = useCallback(() => {
    setEditingRow(null);
    editedFieldsRef.current = {};
  }, []);

  const handleSave = useCallback(() => {
    if (editingRow) {
      const updatedSale = editedFieldsRef.current[editingRow];
      if (updatedSale) {
        handleFieldChange(editingRow, updatedSale);
      }
      setEditingRow(null);
      editedFieldsRef.current = {};
    }
  }, [editingRow, handleFieldChange]);

  const handleDelete = useCallback(
    async (orderNumber: string) => {
      // Optionally, add a confirmation prompt
      if (!confirm("Are you sure you want to delete this order?")) return;
  
      // Remove the order from the state
      setSales((prevSales) =>
        prevSales.filter((sale) => sale.OrderNumber !== orderNumber)
      );
  
      // Make an API call to delete the order from Firebase
      try {
        await axios.post("/api/sales/delete-order", { orderNumber });
      } catch (error) {
        console.error("Error deleting order:", error);
        // Optionally, add error handling and revert state change
      }
    },
    [setSales]
  );

  const handleFieldChangeLocal = useCallback(
    (field: keyof Sale, value: any) => {
      if (editingRow) {
        if (!editedFieldsRef.current[editingRow]) {
          editedFieldsRef.current[editingRow] = {};
        }
        editedFieldsRef.current[editingRow][field] = value;
      }
    },
    [editingRow]
  );

  const renderCustomerCell = useCallback(
    ({ row }: { row: Row<Sale> }) => {
      const sale = row.original;
      const isEditing = editingRow === sale.OrderNumber;

      const value = sale.Customer;

      return (
        <EditableCell
          value={value}
          isEditing={isEditing}
          onChange={(value) => handleFieldChangeLocal("Customer", value)}
        />
      );
    },
    [editingRow, handleFieldChangeLocal]
  );

  
  const renderPrintDatesCell = useCallback(
    ({ row }: { row: Row<Sale> }) => {
      const sale = row.original;
  
      const onDateChange = useCallback(
        (dateRange: DateRange | undefined) => {
          handleDateChange(sale.OrderNumber, dateRange, sale.isManual || false);
        },
        [handleDateChange, sale.OrderNumber, sale.isManual]
      );
  
      return (
        <DatePicker
          dateRange={sale.PrintDateRange}
          onDateChange={onDateChange}
          placeholder="Select date range"
        />
      );
    },
    [handleDateChange]
  );
  
  
  
  const staticColumns: ColumnDef<Sale, any>[] = useMemo(
    () => [
      {
        accessorKey: "group",
        header: "Group",
        enableGrouping: true,
        cell: ({ cell, row, getValue }) => {
          if (row.getIsGrouped()) {
            if (row.subRows.length > 1) {
              const groupValue = getValue<string>();
              let groupLabel = "";
              if (groupValue.startsWith("Murdochs - ")) {
                const datePart = groupValue.replace("Murdochs - ", "");
                groupLabel = `Murdochs (${formatDate(datePart)})`;
              } else {
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
              return null;
            }
          } else {
            return null;
          }
        },
      },
      {
        accessorKey: "Customer",
        header: "Customer",
        cell: renderCustomerCell,
      },
      {
        accessorKey: "OrderNumber",
        header: "Order #",
        cell: ({ row }) => row.original.OrderNumber,
      },
      {
        accessorKey: "PrintDates",
        header: "Print Dates",
        cell: renderPrintDatesCell,
      },
    ],
    [renderPrintDatesCell] // Dependencies for static columns
  );

  const dynamicColumns: ColumnDef<Sale, any>[] = useMemo(
    () => [
     
      {
        accessorKey: "OrderDate",
        header: "Order Date",
        cell: ({ row }) => {
          const sale = row.original;
          const isEditing = editingRow === sale.OrderNumber;
          return (
            <EditableCell
              value={
                isEditing && editedFields[editingRow]?.OrderDate !== undefined
                  ? editedFields[editingRow].OrderDate
                  : sale.OrderDate
              }
              isEditing={isEditing}
              onChange={(value) => handleFieldChangeLocal("OrderDate", value)}
              type="date"
              formatter={formatDate} // Pass formatDate as formatter
            />
          );
        },
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => {
          const sale = row.original;
          const isEditing = editingRow === sale.OrderNumber;
          return (
            <EditableCell
              value={
                isEditing && editedFields[editingRow]?.Status !== undefined
                  ? editedFields[editingRow].Status
                  : sale.Status
              }
              isEditing={isEditing}
              onChange={(value) => handleFieldChangeLocal("Status", value)}
            />
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          const sale = row.original;
          const isEditing = editingRow === sale.OrderNumber;
          if (isEditing) {
            return (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            );
          } else {
            return (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(sale.OrderNumber)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                {sale.isManual && (
                  <button
                    onClick={() => handleDelete(sale.OrderNumber)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          }
        },
      },
    ],
    [
      editingRow,
      editedFields,
      handleFieldChangeLocal,
      handleSave,
      handleCancel,
    ] // Dependencies for dynamic columns
  );
  
  const columns = useMemo(
    () => [...staticColumns, ...dynamicColumns],
    [staticColumns, dynamicColumns]
  );



  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Orders</h1>
      <DataTable columns={columns} data={sales} initialGrouping={["group"]} />
    </div>
  );
};

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  formatter?: (value: string) => string; // Add this line
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  isEditing,
  onChange,
  type = "text",
  formatter, // Destructure the formatter prop
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Initialize localValue when editing starts
  useEffect(() => {
    if (isEditing) {
      setLocalValue(value);
    }
    // We intentionally exclude 'value' from dependencies to prevent resetting localValue during typing
  }, [isEditing]);

  if (isEditing) {
    return (
      <Input
        type={type}
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          onChange(e.target.value);
        }}
        className="border p-1 w-full"
      />
    );
  } else {
    return <span>{formatter ? formatter(value) : value}</span>; // Use formatter if provided
  }
};


export default SalesList;