// interfaces.ts

import { DateRange } from "react-day-picker";

export interface Sale {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  InvoiceAmount?: number; // Make it optional by adding '?'
  group?: string;
  PrintDateRange?: {
    from?: Date | string;
    to?: Date | string;
  };
    isManual?: boolean; // Add this line
  isActive: boolean; // Added property
  totalQuantity?: number; // Add this field
  needsDetailFetch?: boolean; // Optional field to indicate data fetch status
  [key: string]: any; // Index signature
  
}