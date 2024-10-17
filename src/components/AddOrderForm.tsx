import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface AddOrderFormProps {
  onAddOrder: (order: NewOrder) => void;
}

interface NewOrder {
  OrderNumber: string;
  Customer: string;
  OrderDate: string; // ISO date string
  Status: string;
  InvoiceAmount: number;
  PrintDateRange?: DateRange;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ onAddOrder }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [status, setStatus] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrder: NewOrder = {
      OrderNumber: orderNumber,
      Customer: customer,
      OrderDate: orderDate,
      Status: status,
      InvoiceAmount: Number(invoiceAmount),
      // Optionally include PrintDateRange if needed
    };

    onAddOrder(newOrder);

    // Reset form fields
    setOrderNumber('');
    setCustomer('');
    setOrderDate('');
    setStatus('');
    setInvoiceAmount('');
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Add New Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Order Number:</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Customer:</label>
          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Order Date:</label>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Status:</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Invoice Amount:</label>
          <input
            type="number"
            value={invoiceAmount}
            onChange={(e) => setInvoiceAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            className="border p-2 w-full"
            />
        </div>
        {/* Optionally, add a DatePicker for PrintDateRange */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Order
        </button>
      </form>
    </div>
  );
};

export default AddOrderForm;