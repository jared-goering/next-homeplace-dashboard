import React from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Sale } from '../app/interfaces'; // Adjust the import path as necessary
import { format } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { EventContentArg } from '@fullcalendar/core'; // Import FullCalendar's event content type

function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

// Utility function to truncate long event titles
function truncateTitle(title: string, length: number = 20): string {
    return title.length > length ? `${title.substring(0, length)}...` : title;
  }

// Custom render function for events with HoverCard
function renderEventContent(eventInfo: EventContentArg) {
    const truncatedTitle = truncateTitle(eventInfo.event.title);
  
    return (
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '2px 4px',
                color: eventInfo.event.extendedProps.textColor || '#212529',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <i>{truncatedTitle}</i>
            </div>
          </HoverCardTrigger>
          <HoverCardContent
            style={{
              zIndex: 9999,
              position: 'absolute',
              top: 0,
              left: 0,
              fontSize: '0.875rem',
              padding: '8px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ fontWeight: 600 }}>{eventInfo.event.title}</div>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  }

interface SalesCalendarProps {
  sales: Sale[];
}

const SalesCalendar: React.FC<SalesCalendarProps> = ({ sales }) => {
  const events: EventInput[] = sales
    .filter((sale) => {
      if (
        !sale.PrintDateRange ||
        !sale.PrintDateRange.from ||
        !sale.Customer
      ) {
        return false;
      }

      const from = sale.PrintDateRange.from;
      const to = sale.PrintDateRange.to;

      const startDate = from instanceof Date ? from : new Date(from);
      const endDate =
        to !== undefined
          ? to instanceof Date
            ? to
            : new Date(to)
          : startDate;

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        console.warn('Invalid date for sale:', sale);
        return false;
      }

      return true;
    })
    .map((sale) => {
        console.log(sale.Customer);
      const from = sale.PrintDateRange!.from!;
      const to = sale.PrintDateRange!.to;

      const startDate = from instanceof Date ? from : new Date(from);
      const endDate =
        to !== undefined ? (to instanceof Date ? to : new Date(to)) : startDate;

      const adjustedEndDate = new Date(
        endDate.getTime() + 24 * 60 * 60 * 1000
      );

      let backgroundColor;
      let textColor = '';
      
      // Normalize the customer name for matching
      const normalizedCustomer = sale.Customer ? sale.Customer.toLowerCase().trim() : '';
      console.log('Normalized Customer:', normalizedCustomer);

      
      if (normalizedCustomer.includes('murdoch')) {
        backgroundColor = '#d8dbfb'; // Murdochs
        textColor = '#51acf8';
      } else if (!sale.isManual) {
        backgroundColor = '#fbe5d2'; // Printavo
        textColor = '#ec672c';
      } else {
        backgroundColor = '#cdf0d6'; // Regular
        textColor = '#53aa31';
      }

      console.log('Final Background Color:', backgroundColor);
console.log('Final Text Color:', textColor);

      return {
        title: sale.Customer!,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(adjustedEndDate, 'yyyy-MM-dd'),
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        textColor: textColor,
        extendedProps: {
          customer: sale.Customer!,
          status: sale.Status,
          invoiceAmount: sale.InvoiceAmount,
          source: sale.isManual
            ? sale.Customer.includes('Murdoch')
              ? 'Murdochs'
              : 'Regular'
            : 'Printavo',
        },
      };
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Calendar</h1>
      <div className="mb-4">
        <span
          style={{
            backgroundColor: '#fbe5d2',
            color: '#ec672c',
            padding: '4px 8px',
            marginRight: '8px',
            borderRadius: '4px',
          }}
        >
          Printavo
        </span>
        <span
          style={{
            backgroundColor: '#d8dbfb',
            color: '#3d4bf3',
            padding: '4px 8px',
            marginRight: '8px',
            borderRadius: '4px',
          }}
        >
          Murdochs
        </span>
        <span
          style={{
            backgroundColor: '#cdf0d6',
            color: '#53aa31',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          Regular
        </span>
      </div>
      <div style={{ position: 'relative', zIndex: 0 }}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={renderEventContent} // Use the custom render function
        contentHeight="auto"
      />
      </div>
    </div>
  );
};

export default SalesCalendar;