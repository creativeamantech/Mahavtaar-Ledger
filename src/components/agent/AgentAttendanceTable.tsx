import React, { useState } from "react";import {  ColumnDef,  SortingState,  flexRender,  getCoreRowModel,  getPaginationRowModel,  getSortedRowModel,  useReactTable,} from "@tanstack/react-table";import { ArrowUpDown } from "lucide-react";import { Button } from "@/components/ui/button";import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow,} from "@/components/ui/table";import { Badge } from "@/components/ui/badge";import { format as formatTZ, toZonedTime } from 'date-fns-tz';import { format, parseISO, differenceInMinutes } from "date-fns";import { useAuth } from "../../contexts/AuthContext";
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';interface AttendanceRecord {  id: string;  userId: string;  date: string;  loginTime: string;  logoutTime?: string;  breakDuration?: number;
            let breakMinutes = row.original.breakDuration || 0;
            if (row.original.currentBreakStart) {
                const start = parseISO(row.original.currentBreakStart);
                breakMinutes += Math.round((new Date().getTime() - start.getTime()) / 60000);
            }
            const hours = Math.floor(breakMinutes / 60);
            const mins = Math.round(breakMinutes % 60);
            return `${hours}h ${mins}m`;
        }    },    {      id: "productiveHours",      header: "Productive Hours",      cell: ({ row }) => {
          let breakMinutes = row.original.breakDuration || 0;
          if (row.original.currentBreakStart) {
              const start = parseISO(row.original.currentBreakStart);
              breakMinutes += Math.round((new Date().getTime() - start.getTime()) / 60000);
          }
          const { text, deviation } = calculateProductiveHours(row.original, breakMinutes);
          return (
              <div className="flex items-center gap-2">
                  <span>{text}</span>
                  {deviation && text !== "N/A" && <Badge variant="destructive">Deviation</Badge>}
              </div>
          )
      },,    },  ];  const table = useReactTable({    data: agentAttendance,    columns,    onSortingChange: setSorting,    getCoreRowModel: getCoreRowModel(),    getPaginationRowModel: getPaginationRowModel(),    getSortedRowModel: getSortedRowModel(),    state: {      sorting,    },  });  if (user?.role !== 'EXECUTIVE') {    return null;  }  return (    <div className="w-full">      <div className="rounded-md border bg-card overflow-hidden">        <Table>          <TableHeader>            {table.getHeaderGroups().map((headerGroup) => (              <TableRow key={headerGroup.id}>                {headerGroup.headers.map((header) => {                  return (                    <TableHead key={header.id}>                      {header.isPlaceholder                        ? null                        : flexRender(                            header.column.columnDef.header,                            header.getContext()                          )}                    </TableHead>                  );                })}              </TableRow>            ))}          </TableHeader>          <TableBody>            {table.getRowModel().rows?.length ? (              table.getRowModel().rows.map((row) => (                <TableRow                  key={row.id}                  data-state={row.getIsSelected() && "selected"}                >                  {row.getVisibleCells().map((cell) => (                    <TableCell key={cell.id}>                      {flexRender(                        cell.column.columnDef.cell,                        cell.getContext()                      )}                    </TableCell>                  ))}                </TableRow>              ))            ) : (              <TableRow>                <TableCell                  colSpan={columns.length}                  className="h-24 text-center text-muted-foreground"                >                  No attendance records found.                </TableCell>              </TableRow>            )}          </TableBody>        </Table>      </div>      <div className="flex items-center justify-end space-x-2 py-4">        <div className="space-x-2">          <Button            variant="outline"            size="sm"            onClick={() => table.previousPage()}            disabled={!table.getCanPreviousPage()}          >            Previous          </Button>          <Button            variant="outline"            size="sm"            onClick={() => table.nextPage()}            disabled={!table.getCanNextPage()}          >            Next          </Button>        </div>      </div>    </div>  );}
