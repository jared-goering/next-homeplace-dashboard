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

  // Convert `from` and `to` to `Date` objects if they are strings
  const dateRange: DateRange | undefined = sale.PrintDateRange
    ? {
        from:
          sale.PrintDateRange.from instanceof Date
            ? sale.PrintDateRange.from
            : sale.PrintDateRange.from
            ? new Date(sale.PrintDateRange.from)
            : undefined,
        to:
          sale.PrintDateRange.to instanceof Date
            ? sale.PrintDateRange.to
            : sale.PrintDateRange.to
            ? new Date(sale.PrintDateRange.to)
            : undefined,
      }
    : undefined;

  return (
    <DatePicker
      dateRange={dateRange}
      onDateChange={onDateChange}
      placeholder="Select date range"
    />
  );
};

export default React.memo(PrintDatesCell);
