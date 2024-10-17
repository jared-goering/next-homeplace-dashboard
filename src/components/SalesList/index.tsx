// components/SalesList/index.tsx

import React, { useState, useCallback, useRef, useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef, Row, CellContext } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";
import { DateRange } from "react-day-picker";
import EditableCell from "./EditableCell";
import CustomerCell from "./Renderers/CustomerCell";
import OrderDateCell from "./Renderers/OrderDateCell";
import StatusCell from "./Renderers/StatusCell";
import ActionsCell from "./Renderers/ActionsCell";
import PrintDatesCell from "./Renderers/PrintDatesCell";
import axios from "axios";


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
  setSales,
  handleDateChange,
  handleFieldChange,
}) => {
  // State and refs
  const [editingOrderNumber, setEditingOrderNumber] = useState<string | null>(
    null
  );
  const editedFieldsRef = useRef<{ [key: string]: Partial<Sale> }>({});

  // Format date function
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

  // Handlers
  const handleEdit = useCallback((orderNumber: string) => {
    setEditingOrderNumber(orderNumber);
    editedFieldsRef.current = {};
  }, []);

  const handleCancel = useCallback(() => {
    setEditingOrderNumber(null);
    editedFieldsRef.current = {};
  }, []);

  const handleSave = useCallback(() => {
    if (editingOrderNumber) {
      const updatedSale = editedFieldsRef.current[editingOrderNumber];
      if (updatedSale) {
        handleFieldChange(editingOrderNumber, updatedSale);
      }
      setEditingOrderNumber(null);
      editedFieldsRef.current = {};
    }
  }, [editingOrderNumber, handleFieldChange]);

  const handleDelete = useCallback(
    async (orderNumber: string) => {
      if (!confirm("Are you sure you want to delete this order?")) return;

      const saleToDelete = sales.find(
        (sale) => sale.OrderNumber === orderNumber
      );
      if (!saleToDelete) return;

      // Optimistically update the UI
      setSales((prevSales) =>
        prevSales.filter((sale) => sale.OrderNumber !== orderNumber)
      );

      try {
        // Make an API call to delete the order from Firebase
        await axios.post("/api/sales/delete-order", { orderNumber });
      } catch (error) {
        console.error("Error deleting order:", error);
        // Revert the UI update if the API call fails
        setSales((prevSales) => [...prevSales, saleToDelete]);
      }
    },
    [sales, setSales]
  );

  const handleFieldChangeLocal = useCallback(
    (field: keyof Sale, value: any) => {
      if (editingOrderNumber) {
        if (!editedFieldsRef.current[editingOrderNumber]) {
          editedFieldsRef.current[editingOrderNumber] = {};
        }
        editedFieldsRef.current[editingOrderNumber][field] = value;
      }
    },
    [editingOrderNumber]
  );

  // Render functions
  const renderCustomerCell = useCallback(
    ({ row }: { row: Row<Sale> }) => (
      <CustomerCell
        row={row}
        editingOrderNumber={editingOrderNumber}
        handleFieldChangeLocal={handleFieldChangeLocal}
      />
    ),
    [editingOrderNumber, handleFieldChangeLocal]
  );

  const renderOrderDateCell = useCallback(
    ({ row }: { row: Row<Sale> }) => (
      <OrderDateCell
        row={row}
        editingOrderNumber={editingOrderNumber}
        handleFieldChangeLocal={handleFieldChangeLocal}
        formatDate={formatDate}
      />
    ),
    [editingOrderNumber, handleFieldChangeLocal, formatDate]
  );

  const renderStatusCell = useCallback(
    ({ row }: { row: Row<Sale> }) => (
      <StatusCell
        row={row}
        editingOrderNumber={editingOrderNumber}
        handleFieldChangeLocal={handleFieldChangeLocal}
      />
    ),
    [editingOrderNumber, handleFieldChangeLocal]
  );

  const renderActionsCell = useCallback(
    ({ row }: { row: Row<Sale> }) => (
      <ActionsCell
        row={row}
        editingOrderNumber={editingOrderNumber}
        handleEdit={handleEdit}
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleDelete={handleDelete}
      />
    ),
    [editingOrderNumber, handleEdit, handleSave, handleCancel, handleDelete]
  );

  const renderPrintDatesCell = useCallback(
    ({ row }: { row: Row<Sale> }) => (
      <PrintDatesCell
        row={row}
        handleDateChange={handleDateChange}
      />
    ),
    [handleDateChange]
  );

  const renderGroupCell = useCallback(
    ({ cell, row, getValue }: CellContext<Sale, string>) => {
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
        }
        return null;
      }
      return null;
    },
    [formatDate]
  );

  // Columns
  const columns: ColumnDef<Sale, any>[] = useMemo(
    () => [
      {
        accessorKey: "group",
        header: "Group",
        enableGrouping: true,
        cell: renderGroupCell,
      },
      {
        accessorKey: "OrderNumber",
        header: "Order #",
        cell: ({ row }) => row.original.OrderNumber,
      },
      {
        accessorKey: "Customer",
        header: "Customer",
        cell: renderCustomerCell,
      },
      {
        accessorKey: "OrderDate",
        header: "Order Date",
        cell: renderOrderDateCell,
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: renderStatusCell,
      },
      {
        accessorKey: "PrintDates",
        header: "Print Dates",
        cell: renderPrintDatesCell,
      },
      {
        header: "Actions",
        cell: renderActionsCell,
      },
    ],
    [
      renderGroupCell,
      renderCustomerCell,
      renderOrderDateCell,
      renderStatusCell,
      renderPrintDatesCell,
      renderActionsCell,
    ]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Orders</h1>
      <DataTable columns={columns} data={sales} initialGrouping={["group"]} />
    </div>
  );
};

export default SalesList;
