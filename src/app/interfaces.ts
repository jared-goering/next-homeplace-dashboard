// interfaces.ts

import { DateRange } from "react-day-picker";

export interface Sale {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  InvoiceAmount: number;
  group?: string;
  PrintDateRange?: DateRange;
  isManual?: boolean; // Add this line
  isActive: boolean; // Added property
}