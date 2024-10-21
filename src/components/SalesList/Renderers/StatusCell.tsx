// components/SalesList/Renderers/StatusCell.tsx

import React, { useState, useEffect, useContext } from "react";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";
import { SalesListContext } from "../SalesListContext";

interface StatusCellProps {
  row: Row<Sale>;
}

const StatusCell: React.FC<StatusCellProps> = ({ row }) => {
  const sale = row.original;

  const context = useContext(SalesListContext);
  if (!context) {
    throw new Error("StatusCell must be used within a SalesListContext.Provider");
  }

  const { editingOrderNumber, handleFieldChangeLocal } = context;
  const isEditing = sale.OrderNumber === editingOrderNumber;

  const [value, setValue] = useState(sale.Status || "");

  useEffect(() => {
    if (isEditing) {
      setValue(sale.Status || "");
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    handleFieldChangeLocal("Status", newValue);
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="border p-1 w-full"
      />
    );
  } else {
    return <span>{sale.Status}</span>;
  }
};

export default StatusCell;
