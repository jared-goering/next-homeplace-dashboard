
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
    handleFieldChange: (orderNumber: string, updatedFields: Partial<Sale>) => void; // Changed to Partial<Sale>
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
      
        // Split at 'T' to separate date and time
        const [datePart] = dateString.split('T');
      
        const [year, month, day] = datePart.split('-').map(Number);
      
        // console.log("Parsed values - Year:", year, "Month:", month, "Day:", day);
      
        const date = new Date(year, month - 1, day);
      
        if (isNaN(date.getTime())) {
          console.error("Invalid Date object constructed from dateString:", dateString);
          return "Invalid Date";
        }
      
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(date);
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
        handleFieldChange(editingOrderNumber, editedValuesRef.current); // Pass only the edited fields
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
      // Send the prefixed order number to the API
      await axios.post("/api/sales/delete-order", { orderNumber });
    } catch (error) {
      console.error("Error deleting order:", error);
      // Revert the state if deletion fails
      setSales((prevSales) => [...prevSales, saleToDelete]);
    }
  };
  

// Mapping of group prefixes to labels
const groupPrefixMap = {
    'Murdochs - ': 'Murdochs',
    'Printavo - ': 'Printavo',
    'NoGroup-': 'No Group',
  } as const;
  
  type GroupPrefix = keyof typeof groupPrefixMap;

    // Determine styles based on order type
    const getOrderStyles = (group: string) => {
        if (group.startsWith("Murdochs")) {
          return { backgroundColor: '#d8dbfb', color: '#51acf8', borderColor: '#51acf8' };
        } else if (group.startsWith("Printavo")) {
          return { backgroundColor: '#fbe5d2', color: '#ec672c', borderColor: '#ec672c' };
        } else {
          return { backgroundColor: '#cdf0d6', color: '#53aa31', borderColor: '#53aa31' };
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
              let groupLabel = "Uncategorized";
    
              // Iterate over the mapping to find the matching prefix
              for (const prefix in groupPrefixMap) {
                if (groupPrefixMap.hasOwnProperty(prefix)) {
                  const typedPrefix = prefix as GroupPrefix; // Assert prefix type
                  if (groupValue.startsWith(typedPrefix)) {
                    const identifier = groupValue.replace(typedPrefix, "");
                    // Check if the prefix includes a date
                    if (typedPrefix.endsWith(' - ')) {
                      groupLabel = `${groupPrefixMap[typedPrefix]} (${formatDate(identifier)})`;
                    } else {
                      groupLabel = groupPrefixMap[typedPrefix];
                    }
                    break;
                  }
                }
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
        accessorKey: "totalQuantity",
        header: "Total Quantity",
        cell: ({ row }) => {
          const totalQuantity = row.original.totalQuantity;
          return totalQuantity !== undefined && totalQuantity !== null ? totalQuantity : "N/A";
        },
      },
      
    {
      accessorKey: "PrintDates",
      header: "Print Dates",
      cell: ({ row }) => (
        <PrintDatesCell row={row} handleDateChange={handleDateChange} />
      ),
    },
    {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => <StatusCell row={row} />,
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
      <div className="min-h-[400px] "> {/* Set a minimum height */}
        {sales.length > 0 ? (
          <DataTable columns={columns} data={sales} initialGrouping={['group']} />
        ) : (
          // Placeholder content when there are no sales
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No orders found.</p>
          </div>
        )}
      </div>
    </SalesListContext.Provider>
  );
};

export default SalesList;
