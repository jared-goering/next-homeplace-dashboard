// components/SalesList/Renderers/OrderDateCell.tsx

import React, { useState, useEffect, useContext } from "react";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";
import { SalesListContext } from "../SalesListContext";

interface OrderDateCellProps {
  row: Row<Sale>;
  formatDate: (dateString: string) => string;
}

const OrderDateCell: React.FC<OrderDateCellProps> = ({ row, formatDate }) => {
  const sale = row.original;

  const context = useContext(SalesListContext);
  if (!context) {
    throw new Error("OrderDateCell must be used within a SalesListContext.Provider");
  }

  const { editingOrderNumber, handleFieldChangeLocal } = context;
  const isEditing = sale.OrderNumber === editingOrderNumber;

  const [value, setValue] = useState(sale.OrderDate || "");

  useEffect(() => {
    if (isEditing) {
      setValue(sale.OrderDate || "");
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    handleFieldChangeLocal("OrderDate", newValue);
  };

  if (isEditing) {
    return (
      <input
        type="date"
        value={value}
        onChange={handleChange}
        className="border p-1 w-full"
      />
    );
  } else {
    return <span>{formatDate(sale.OrderDate)}</span>;
  }
};

export default OrderDateCell;
