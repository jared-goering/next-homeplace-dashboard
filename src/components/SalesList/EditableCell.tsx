// components/SalesList/EditableCell.tsx

import React from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  formatter?: (value: string) => string;
}

const EditableCell: React.FC<EditableCellProps> = React.memo(
  ({ value, isEditing, onChange, type = "text", formatter }) => {
    if (isEditing) {
      return (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border p-1 w-full"
        />
      );
    } else {
      return <span>{formatter ? formatter(value) : value}</span>;
    }
  }
);

export default EditableCell;
