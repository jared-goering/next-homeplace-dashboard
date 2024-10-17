// components/Renderers/ActionsCell.tsx

import React from "react";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";

interface ActionsCellProps {
  row: Row<Sale>;
  editingOrderNumber: string | null;
  handleEdit: (orderNumber: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleDelete: (orderNumber: string) => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  row,
  editingOrderNumber,
  handleEdit,
  handleSave,
  handleCancel,
  handleDelete,
}) => {
  const sale = row.original;
  const isEditing = editingOrderNumber === sale.OrderNumber;

  return isEditing ? (
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
  ) : (
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
};

export default React.memo(ActionsCell);
