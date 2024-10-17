import React from "react";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Sale } from "../app/interfaces"; // Adjust the import path as necessary
import { format } from "date-fns";

// Import FullCalendar styles
// import "@fullcalendar/common/main.css";
// import "@fullcalendar/daygrid/main.css";

// A custom render function for events
function renderEventContent(eventInfo: any) {
  return (
    <>
      <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
    </>
  );
}

interface SalesCalendarProps {
  sales: Sale[];
}

const SalesCalendar: React.FC<SalesCalendarProps> = ({ sales }) => {
  // Prepare events from sales data
  const events: EventInput[] = sales
    .filter((sale) => sale.PrintDateRange && sale.PrintDateRange.from)
    .map((sale) => {
      const { from, to } = sale.PrintDateRange!;
      const startDate = from!;
      // Add one day to the end date since FullCalendar treats the end date as exclusive
      const endDate = to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : from!;

      return {
        title: `${sale.Customer}`,
        start: format(startDate, "yyyy-MM-dd"),
        end: format(endDate, "yyyy-MM-dd"),
        extendedProps: {
          customer: sale.Customer,
          status: sale.Status,
          invoiceAmount: sale.InvoiceAmount,
        },
      };
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={renderEventContent}
        // height="600px" // Set desired height
        contentHeight="auto" // Adjust content height automatically
        />
    </div>
  );
};

export default SalesCalendar;