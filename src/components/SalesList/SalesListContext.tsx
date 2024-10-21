// SalesListContext.tsx
import React from 'react';
import { Sale } from '@/app/interfaces';

interface SalesListContextProps {
  editingOrderNumber: string | null;
  handleFieldChangeLocal: (field: keyof Sale, value: any) => void;
}

export const SalesListContext = React.createContext<SalesListContextProps | null>(null);
