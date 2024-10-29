// components/SalesList/Renderers/OrderDateCell.tsx

import React, { useState, useEffect, useContext } from "react";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";
import { SalesListContext } from "../SalesListContext";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react"; // Ensure you have this icon
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"; // Utility for conditional classNames

interface OrderDateCellProps {
  row: Row<Sale>;
  formatDate: (dateString: string) => string;
}

const OrderDateCell: React.FC<OrderDateCellProps> = ({ row, formatDate }) => {
  const sale = row.original;

  const context = useContext(SalesListContext);
  if (!context) {
    throw new Error(
      "OrderDateCell must be used within a SalesListContext.Provider"
    );
  }

  const { editingOrderNumber, handleFieldChangeLocal } = context;
  const isEditing = sale.OrderNumber === editingOrderNumber;

  // State to hold the selected date
  const [value, setValue] = useState<Date | undefined>(
    sale.OrderDate ? new Date(sale.OrderDate) : undefined
  );

  useEffect(() => {
    if (isEditing) {
      setValue(sale.OrderDate ? new Date(sale.OrderDate) : undefined);
    }
  }, [isEditing, sale.OrderDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setValue(date);
    // Convert the selected date to the appropriate format before saving
    const newValue = date ? date.toISOString().split("T")[0] : "";
    handleFieldChangeLocal('OrderDate', newValue);
  };

  if (isEditing) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value ? format(value, "yyyy-MM-dd") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  } else {
    return <span>{formatDate(sale.OrderDate)}</span>;
  }
};

export default OrderDateCell;
