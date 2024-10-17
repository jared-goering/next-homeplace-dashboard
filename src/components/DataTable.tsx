// components/DataTable.tsx

"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  useReactTable,
  Row,
  ExpandedState,
  GroupingState,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown } from "lucide-react";
import { debounce } from "lodash";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialGrouping?: GroupingState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialGrouping = [],
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [grouping, setGrouping] = React.useState<GroupingState>(initialGrouping);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  // Debounce the search input to optimize performance
  const handleFilterChange = React.useMemo(
    () =>
      debounce((value: string) => {
        setGlobalFilter(value);
      }, 300),
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      grouping,
      expanded,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  // Calculate the total number of orders
  const totalOrders = table.getPrePaginationRowModel().rows.length;

  function renderRow(row: Row<TData>) {
    if (row.getIsGrouped()) {
      // This is a grouped row
      if (row.subRows.length > 1) {
        // Render group header with expand/collapse button
        return (
          <React.Fragment key={row.id}>
            <TableRow className="hover:bg-gray-100">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{ paddingLeft: `${row.depth * 1.5}rem` }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
            {row.getIsExpanded() &&
              row.subRows.map((subRow) => renderRow(subRow))}
          </React.Fragment>
        );
      } else {
        // Group has only one sub-row; render the sub-row directly
        return renderRow(row.subRows[0]);
      }
    } else {
      // This is a regular row
      return (
        <TableRow key={row.id} className="hover:bg-gray-100">
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              style={{ paddingLeft: `${row.depth * 1.5}rem` }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    }
  }

  return (
    <div className="rounded-md border">
  {/* Search Input */}
  <div className="p-4">
    <Input
      placeholder="Search..."
      onChange={(e) => handleFilterChange(e.target.value)}
    />
  </div>

  {/* Table Container */}
  <div className="overflow-x-auto" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="cursor-pointer select-none"
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getCanSort() && (
                    <ChevronsUpDown
                      className={`ml-2 h-4 w-4 transition-transform ${
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === "desc"
                            ? "rotate-180"
                            : "rotate-0"
                          : ""
                      }`}
                    />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => renderRow(row))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>

  {/* Footer with Total Orders */}
  <div className="sticky bottom-0 bg-white p-4 text-right font-semibold">
    Total Orders: {totalOrders}
  </div>
</div>
  );
}