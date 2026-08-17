import { useState } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";

import { useStatement, useParties } from "@/hooks/use-erp-data";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function Statement() {
  const { data: partiesData } = useParties();
  const parties = (partiesData ?? []) as Array<{
    id: number;
    partyName?: string;
    powerLoom?: string;
    pick?: string;
    advanceBalance?: number | string | null;
    currentBalance?: number | string | null;
  }>;

  const [selectedPartyId, setSelectedPartyId] = useState<number>();

  const { data, isLoading } = useStatement(selectedPartyId);
  const statement = (data ?? []) as Array<Record<string, any>>;
console.log(statement);
  const selectedParty = parties.find(
    (p) => p.id === selectedPartyId
  );
const salaryRow = [...statement]
  .reverse()
  .find(
    (row: any) =>
      row.description === "Salary" ||
      row.description === "Salary Paid"
  );
const currentAdvance = Number(selectedParty?.advanceBalance ?? 0);

const currentBalance = Number(selectedParty?.currentBalance ?? 0);

  const totalCredit = statement.reduce(
    (sum: number, row: any) =>
      sum + Number(row.credit || 0),
    0
  );

  const totalDebit = statement.reduce(
    (sum: number, row: any) =>
      sum + Number(row.debit || 0),
    0
  );


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <style>{`
        @media print{

          @page{
            size:A4 portrait;
            margin:8mm;
          }
            .print-page{
    width:100%;
    overflow:hidden;
}

table{
    width:100% !important;
}

th,
td{
    white-space:normal;
    word-break:break-word;
}

          html,body{
            width:210mm;
            background:white;
          }

          .no-print{
            display:none!important;
          }

          table{
            width:100%;
            border-collapse:collapse;
            table-layout:fixed;
          }

          th,td{
            padding:2px;
            font-size:8px;
            border:1px solid #d1d5db;
          }

        }
      `}</style>

      {/* Top Controls */}

      <div className="no-print bg-white border p-4 flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold text-[#800000]">

            Ledger Statement

          </h2>

          <p className="text-sm text-gray-500">

            Select Party

          </p>

        </div>

        <div className="flex gap-3">

          <Select
            value={selectedPartyId?.toString() || ""}
            onValueChange={(v) =>
              setSelectedPartyId(Number(v))
            }
          >

            <SelectTrigger className="w-72 rounded-none">

              <SelectValue placeholder="Select Party" />

            </SelectTrigger>

            <SelectContent>

              {parties.map((party) => (

                <SelectItem
                  key={party.id}
                  value={party.id.toString()}
                >

                  {party.partyName}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>

          <Button
            onClick={handlePrint}
            disabled={!selectedPartyId}
            className="rounded-none bg-[#800000]"
          >

            <Printer className="w-4 h-4 mr-2" />

            Print

          </Button>

        </div>

      </div>

      {selectedPartyId ? (

        <div className="print-page bg-white w-[190mm] min-h-[277mm] mx-auto border border-gray-300 p-4 overflow-hidden">
          <div className="flex justify-between items-start border-b-2 border-[#800000] pb-5">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 border flex items-center justify-center">

                <img
                  src="/logo1.png"
                  alt="SSVT Logo"
                  className="w-10 h-10 object-contain"
                />

              </div>

              <div>

                <h1 className="text-2xl font-bold text-[#800000] tracking-wide">
                  Sri Sakthi Vinayaka Textiles
                </h1>

                <p className="text-sm tracking-[4px] uppercase text-gray-600">
                  LEDGER STATEMENT
                </p>

              </div>

            </div>

            <div className="text-right text-sm space-y-1">
              <p>
                <span className="font-semibold">Generated Date :</span>
                {format(new Date(), "dd-MM-yyyy")}
              
               </p>
            </div>

          </div>

          {/* Party Information */}

          <div className="border border-gray-300 mt-6">
            <div className="bg-[#800000] text-white px-3 py-2 font-semibold">
              PARTY INFORMATION
            </div>

            <div className="grid grid-cols-2 gap-8 p-5">
              <div className="space-y-3">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Party Name</span>
                  <span>{selectedParty?.partyName}</span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Company Name</span>
                  <span>Sri Sakthi Vinayaka Textiles</span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Power Loom</span>
                  <span>{selectedParty?.powerLoom}</span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Pick</span>
                  <span>{selectedParty?.pick}</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-base font-semibold text-black">
                      Current Advance
                    </span>
                    <span className="text-base font-semibold text-black">
                      ₹{currentAdvance.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xl font-bold text-black">
                      Current Balance
                    </span>
                    <span className="text-xl font-bold text-black">
                      ₹{currentBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}

          <div className="mt-6 border border-gray-300 w-full">
            <Table className="w-full table-fixed text-[8px] border-collapse">
              <TableHeader className="bg-[#800000]">
                <TableRow>
                  <TableHead className="w-[10%] px-1 text-center text-white">Date</TableHead>
                  <TableHead className="w-[26%] px-1 text-left text-white">Description</TableHead>
                  <TableHead className="w-[10%] px-1 text-right text-white">Meter</TableHead>
                  <TableHead className="w-[9%] px-1 text-right text-white">
  Pieces
</TableHead>
                  <TableHead className="w-[14%] px-1 text-center text-white">Bag</TableHead>
                  <TableHead className="w-[18%] px-1 text-center text-white">Beam</TableHead>
                  <TableHead className="w-[11%] px-1 text-right text-white">Credit</TableHead>
                  <TableHead className="w-[11%] px-1 text-right text-white">Debit</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Loading Statement...
                    </TableCell>
                  </TableRow>
                ) : statement.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No Records Found
                    </TableCell>
                  </TableRow>
                ) : (
                  statement.map((row: any, index: number) => (
                    <TableRow
                      key={row.id}
                      className={
                        index % 2 === 0
                          ? "bg-white hover:bg-gray-50"
                          : "bg-gray-100 hover:bg-gray-50"
                      }
                    >
                      <TableCell className="whitespace-nowrap text-center text-[9px] px-1">
                        {format(new Date(row.date), "dd-MM-yyyy")}
                      </TableCell>

                      <TableCell>
                        {row.description}
                        {row.note && (
                          <div className="text-[10px] text-gray-500">{row.note}</div>
                        )}
                      </TableCell>
<TableCell className="text-right">
  {row.meter ?? "-"}
</TableCell>

<TableCell className="text-right">
  {row.pieces !== null && row.pieces !== undefined
    ? `${row.pieces} Pcs`
    : "-"}
</TableCell>

<TableCell className="text-center">
  {row.bagType
    ? `${row.bagType} - ${row.bagWeight}`
    : "-"}
</TableCell>
                      <TableCell className="text-center">
                        {row.beamCount ? `${row.beamCount} Beam - ${row.beamMeter} Mtr` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-green-700 font-semibold">
                        {row.credit ? `₹${Number(row.credit).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-red-700 font-semibold">
                        {row.debit ? `₹${Number(row.debit).toLocaleString()}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}

          <div className="mt-10 border-t border-gray-300 pt-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600">Generated by</p>
                <p className="text-sm text-gray-600">SSVT</p>
              </div>

              <div className="text-center">
                
                <p className="text-sm">Authorised Signature</p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-8">
              This is a computer generated ledger statement.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64 border border-dashed border-gray-300 bg-white flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#800000]">Sri Sakthi Vinayaka Textiles</h3>
            <p className="text-gray-500 mt-2">
              Please select a party to view the ledger statement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}