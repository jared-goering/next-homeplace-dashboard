// components/Renderers/OrderDateCell.tsx

import React from "react";
import EditableCell from "@/components/SalesList/EditableCell";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";

interface OrderDateCellProps {
  row: Row<Sale>;
  editingOrderNumber: string | null;
  handleFieldChangeLocal: (field: keyof Sale, value: any) => void;
  formatDate: (dateString: string) => string;
}

const OrderDateCell: React.FC<OrderDateCellProps> = ({
  row,
  editingOrderNumber,
  handleFieldChangeLocal,
  formatDate,
}) => {
  const sale = row.original;
  const isEditing = editingOrderNumber === sale.OrderNumber;

  const value =
    isEditing && sale.OrderDate !== undefined ? sale.OrderDate : sale.OrderDate;

  return (
    <EditableCell
      value={value}
      isEditing={isEditing}
      onChange={(value) => handleFieldChangeLocal("OrderDate", value)}
      type="date"
      formatter={formatDate}
    />
  );
};

export default React.memo(OrderDateCell);
