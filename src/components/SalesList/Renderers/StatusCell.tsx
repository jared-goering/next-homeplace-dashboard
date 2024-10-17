// components/SalesList/Renderers/StatusCell.tsx

import React from "react";
import EditableCell from "../EditableCell";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";

interface StatusCellProps {
  row: Row<Sale>;
  editingOrderNumber: string | null;
  handleFieldChangeLocal: (field: keyof Sale, value: any) => void;
}

const StatusCell: React.FC<StatusCellProps> = ({
  row,
  editingOrderNumber,
  handleFieldChangeLocal,
}) => {
  const sale = row.original;
  const isEditing = editingOrderNumber === sale.OrderNumber;

  const value =
    isEditing && sale.Status !== undefined ? sale.Status : sale.Status;

  return (
    <EditableCell
      value={value}
      isEditing={isEditing}
      onChange={(value) => handleFieldChangeLocal("Status", value)}
    />
  );
};

export default React.memo(StatusCell);
