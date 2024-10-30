import React, { useState, Fragment } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Sale } from '../app/interfaces'; // Adjust the import path as necessary
import { format } from 'date-fns';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { EventContentArg } from '@fullcalendar/core'; // Import FullCalendar's event content type
import { Dialog, Transition } from '@headlessui/react';
import { Maximize2, X } from 'lucide-react'; // Import Lucide icons


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
  const isActive = eventInfo.event.extendedProps.isActive;

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
              opacity: isActive ? 1 : 0.5, // Adjust opacity based on isActive
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

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to open the modal
    const openModal = () => setIsModalOpen(true);
  
    // Function to close the modal
    const closeModal = () => setIsModalOpen(false);

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
      const normalizedCustomer = sale.Customer
        ? sale.Customer.toLowerCase().trim()
        : '';

        // Determine the order type
        const isMurdochs = normalizedCustomer.includes('murdoch');
        const isPrintavo = sale.OrderNumber.includes('Printavo');

        if (isMurdochs) {
        backgroundColor = '#d8dbfb'; // Murdochs
        textColor = '#51acf8';
        } else if (isPrintavo) {
        backgroundColor = '#fbe5d2'; // Printavo
        textColor = '#ec672c';
        } else {
        backgroundColor = '#cdf0d6'; // Regular
        textColor = '#53aa31';
        }

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
          textColor: textColor, // Add textColor to extendedProps
          isActive: sale.isActive, // Add isActive to extendedProps
        },
      };
    });

  // Define eventDidMount function
  function eventDidMount(info: any) {
    if (!info.event.extendedProps.isActive) {
      // Apply opacity to the event element
      info.el.style.opacity = '0.5';
    }
  }

  

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sales Calendar</h1>

      {/* Full Screen Button */}
      <div className="mb-4 flex items-center">
        <div className="mr-auto">
          {/* Your existing legend */}
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

         {/* Full Screen Button */}
         <button
            onClick={openModal}
            className="flex items-center justify-center w-10 h-10 border rounded-full border-[#e93362] text-[#e93362] hover:bg-[#e93362] hover:text-white transition-colors"
            >
            <Maximize2 className="w-5 h-5" /> {/* Full screen open icon */}
            </button>

      </div>

      {/* Calendar */}
      <div style={{ position: 'relative', zIndex: 0 }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={renderEventContent}
          eventDidMount={eventDidMount}
          contentHeight="auto"
        />
      </div>

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
  <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={closeModal}>
    <div className="min-h-screen px-4 text-center">
      {/* Overlay */}
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black opacity-50" aria-hidden="true" />
      </Transition.Child>

      {/* Centering trick */}
      <span className="inline-block h-screen align-middle" aria-hidden="true">
        &#8203;
      </span>

      {/* Modal content */}
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Dialog.Panel className="inline-block w-full max-w-7xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          
          {/* Close Button Container */}
          <div className="flex justify-end">
            <button
              onClick={closeModal}
              className="flex items-center justify-center w-8 h-8 border rounded-full border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" /> {/* Close icon */}
            </button>
          </div>

          {/* Full-screen Calendar */}
          <div className="mt-2">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventContent={renderEventContent}
              eventDidMount={eventDidMount}
              height="auto"
            />
          </div>
        </Dialog.Panel>
      </Transition.Child>
    </div>
  </Dialog>
</Transition>

    </div>
  );
};

export default SalesCalendar;