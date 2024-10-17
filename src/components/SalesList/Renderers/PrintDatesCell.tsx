// components/SalesList/Renderers/PrintDatesCell.tsx

import React, { useCallback } from "react";
import { Row } from "@tanstack/react-table";
import { Sale } from "@/app/interfaces";
import DatePicker from "@/components/DatePicker";
import { DateRange } from "react-day-picker";

interface PrintDatesCellProps {
  row: Row<Sale>;
  handleDateChange: (
    orderNumber: string,
    dateRange: DateRange | undefined,
    isManual: boolean
  ) => Promise<void>;
}

const PrintDatesCell: React.FC<PrintDatesCellProps> = ({
  row,
  handleDateChange,
}) => {
  const sale = row.original;

  const onDateChange = useCallback(
    (dateRange: DateRange | undefined) => {
      handleDateChange(sale.OrderNumber, dateRange, sale.isManual || false);
    },
    [handleDateChange, sale.OrderNumber, sale.isManual]
  );

  return (
    <DatePicker
      dateRange={sale.PrintDateRange}
      onDateChange={onDateChange}
      placeholder="Select date range"
    />
  );
};

export default React.memo(PrintDatesCell);
