import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReactNode } from "react";

interface ERPTableProps {
  headers: string[];
  children: ReactNode;
}

export function ERPTable({ headers, children }: ERPTableProps) {
  return (
    <div className="border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {headers.map((header, i) => (
              <TableHead key={i} className="font-bold text-foreground h-10 border-b border-border text-xs uppercase tracking-wider">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </div>
  );
}
