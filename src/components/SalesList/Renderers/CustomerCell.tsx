// components/Renderers/CustomerCell.tsx

import React from "react";
import EditableCell from "@/components/SalesList/EditableCell";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";

interface CustomerCellProps {
  row: Row<Sale>;
  editingOrderNumber: string | null;
  handleFieldChangeLocal: (field: keyof Sale, value: any) => void;
}

const CustomerCell: React.FC<CustomerCellProps> = ({
  row,
  editingOrderNumber,
  handleFieldChangeLocal,
}) => {
  const sale = row.original;
  const isEditing = editingOrderNumber === sale.OrderNumber;

  const value =
    isEditing && sale.Customer !== undefined ? sale.Customer : sale.Customer;

  return (
    <EditableCell
      value={value}
      isEditing={isEditing}
      onChange={(value) => handleFieldChangeLocal("Customer", value)}
    />
  );
};

export default React.memo(CustomerCell);
