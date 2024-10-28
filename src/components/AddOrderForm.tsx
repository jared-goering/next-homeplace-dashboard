import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

interface AddOrderFormProps {
  onAddOrder: (order: NewOrder) => void;
}

interface NewOrder {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  totalQuantity: number; // Changed from InvoiceAmount to totalQuantity
  PrintDateRange?: DateRange;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ onAddOrder }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [orderDate, setOrderDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState('');
  const [orderQuantity, setOrderQuantity] = useState<number | ''>(''); // New state for order quantity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrder: NewOrder = {
      OrderNumber: orderNumber,
      Customer: customer,
      OrderDate: orderDate ? orderDate.toISOString() : '',
      Status: status,
      totalQuantity: Number(orderQuantity), // Use orderQuantity here
    };

    onAddOrder(newOrder);

    // Reset form fields
    setOrderNumber('');
    setCustomer('');
    setOrderDate(undefined);
    setStatus('');
    setOrderQuantity(''); // Reset orderQuantity
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Add New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Order Number:</label>
              <Input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                placeholder="Enter order number"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Customer:</label>
              <Input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Order Date:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-left"
                  >
                    {orderDate ? format(orderDate, 'PPP') : 'Pick a date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={setOrderDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block font-medium mb-1">Status:</label>
              <Input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                placeholder="Enter status"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Order Quantity:</label>
              <Input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                required
                placeholder="Enter order quantity"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} type="submit" className="bg-blue-500 text-white w-full">
          Add Order
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddOrderForm;
