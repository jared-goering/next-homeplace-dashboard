import React from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import { Sale } from '../app/interfaces'; // Adjust the import path as necessary
import { format } from 'date-fns';

function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

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
    .filter((sale) => {
      // Ensure sale has necessary properties
      if (
        !sale.PrintDateRange ||
        !sale.PrintDateRange.from ||
        !sale.Customer
      ) {
        return false;
      }

      const from = sale.PrintDateRange.from;
      const to = sale.PrintDateRange.to;

      // Ensure 'from' and 'to' are valid Date objects
      const startDate = from instanceof Date ? from : new Date(from);
      const endDate =
        to !== undefined
          ? to instanceof Date
            ? to
            : new Date(to)
          : startDate;

      // Validate dates
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        console.warn('Invalid date for sale:', sale);
        return false; // Exclude this sale
      }

      return true; // Include this sale
    })
    .map((sale) => {
      const from = sale.PrintDateRange!.from!;
      const to = sale.PrintDateRange!.to;

      const startDate = from instanceof Date ? from : new Date(from);
      const endDate =
        to !== undefined ? (to instanceof Date ? to : new Date(to)) : startDate;

      // Adjust endDate for FullCalendar's exclusive end date
      const adjustedEndDate = new Date(
        endDate.getTime() + 24 * 60 * 60 * 1000
      );

      return {
        title: sale.Customer!,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(adjustedEndDate, 'yyyy-MM-dd'),
        extendedProps: {
          customer: sale.Customer!,
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
        contentHeight="auto"
      />
    </div>
  );
};

export default SalesCalendar;
