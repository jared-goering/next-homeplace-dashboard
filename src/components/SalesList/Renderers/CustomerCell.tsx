import React, { useState, useEffect, useContext } from "react";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";
import { SalesListContext } from "../SalesListContext";

interface CustomerCellProps {
  row: Row<Sale>;
}

const CustomerCell: React.FC<CustomerCellProps> = ({ row }) => {
  const sale = row.original;

  const context = useContext(SalesListContext);
  if (!context) {
    throw new Error("CustomerCell must be used within a SalesListContext.Provider");
  }

  const { editingOrderNumber, handleFieldChangeLocal } = context;
  const isEditing = sale.OrderNumber === editingOrderNumber;

  const [value, setValue] = useState(sale.Customer || "");

  useEffect(() => {
    if (isEditing) {
      setValue(sale.Customer || "");
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    handleFieldChangeLocal("Customer", newValue);
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
    return <span>{sale.Customer}</span>;
  }
};

export default CustomerCell;
