
import React, { useState, useMemo, useCallback, useRef } from "react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef, Row, CellContext } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";
import { DateRange } from "react-day-picker";
import CustomerCell from "./Renderers/CustomerCell";
import OrderDateCell from "./Renderers/OrderDateCell";
import StatusCell from "./Renderers/StatusCell";
import ActionsCell from "./Renderers/ActionsCell";
import PrintDatesCell from "./Renderers/PrintDatesCell";
import axios from "axios";
import { SalesListContext } from './SalesListContext';

interface SalesListProps {
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    handleDateChange: (
      orderNumber: string,
      dateRange: DateRange | undefined,
      isManual: boolean
    ) => Promise<void>;
    handleFieldChange: (orderNumber: string, updatedSale: Sale) => void; // Change Partial<Sale> to Sale
  }
  

  const SalesList: React.FC<SalesListProps> = ({
  sales,
  setSales,
  handleDateChange,
  handleFieldChange,
}) => {
    const [editingOrderNumber, setEditingOrderNumber] = useState<string | null>(null);
    const [editedValues, setEditedValues] = useState<Partial<Sale>>({});
    const editedValuesRef = useRef<Partial<Sale>>({});


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

const handleFieldChangeLocal = useCallback(
    (field: keyof Sale, value: any) => {
      editedValuesRef.current = {
        ...editedValuesRef.current,
        [field]: value,
      };
    },
    []
  );


  const contextValue = useMemo(
    () => ({
      editingOrderNumber,
      handleFieldChangeLocal,
    }),
    [editingOrderNumber, handleFieldChangeLocal]
  );

  const handleEdit = (orderNumber: string) => {
    setEditingOrderNumber(orderNumber);
  };

  const handleCancel = () => {
    setEditingOrderNumber(null);
  };

  const handleSave = useCallback(() => {
    if (editingOrderNumber) {
      const updatedSale = sales.find(
        (sale) => sale.OrderNumber === editingOrderNumber
      );

      if (updatedSale) {
        const newSale = { ...updatedSale, ...editedValuesRef.current };

        // Update the sales state
        setSales((prevSales) =>
          prevSales.map((sale) =>
            sale.OrderNumber === editingOrderNumber ? newSale : sale
          )
        );

        // Call handleFieldChange to update the backend
        handleFieldChange(editingOrderNumber, newSale);
      }
    }
    setEditingOrderNumber(null);
    editedValuesRef.current = {};
  }, [
    editingOrderNumber,
    sales,
    setSales,
    handleFieldChange,
  ]);
  

  const handleDelete = async (orderNumber: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    const saleToDelete = sales.find(
      (sale) => sale.OrderNumber === orderNumber
    );
    if (!saleToDelete) return;

    setSales((prevSales) =>
      prevSales.filter((sale) => sale.OrderNumber !== orderNumber)
    );

    try {
      await axios.post("/api/sales/delete-order", { orderNumber });
    } catch (error) {
      console.error("Error deleting order:", error);
      setSales((prevSales) => [...prevSales, saleToDelete]);
    }
  };



  const columns: ColumnDef<Sale, any>[] = useMemo(() => [
    {
      accessorKey: "group",
      header: "Group",
      enableGrouping: true,
      cell: ({ cell, row, getValue }: CellContext<Sale, string>) => {
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
    },
    {
        accessorKey: "OrderNumber",
        header: "Order #",
        cell: ({ row }) => row.original.OrderNumber,
      },
    {
        accessorKey: 'Customer',
        header: 'Customer',
        cell: ({ row }) => <CustomerCell row={row} />,
      },
      {
        accessorKey: "OrderDate",
        header: "Order Date",
        cell: ({ row }) => <OrderDateCell row={row} formatDate={formatDate} />,
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => <StatusCell row={row} />,
      },
    {
      accessorKey: "PrintDates",
      header: "Print Dates",
      cell: ({ row }) => (
        <PrintDatesCell row={row} handleDateChange={handleDateChange} />
      ),
    },
    {
        header: "Actions",
        cell: ({ row }) => (
          <ActionsCell
            row={row}
            editingOrderNumber={editingOrderNumber}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleDelete={handleDelete}
          />
        ),
      },
    ],
    [
      formatDate,
      handleDateChange,
      handleEdit,
      handleSave,
      handleCancel,
      handleDelete,
      editingOrderNumber,
    ]
  );

  return (
    <SalesListContext.Provider value={contextValue}>
      <div>
        <h1 className="text-2xl font-bold mb-4">Sales Orders</h1>
        <DataTable columns={columns} data={sales} initialGrouping={['group']} />
      </div>
    </SalesListContext.Provider>
  );
};

export default SalesList;
