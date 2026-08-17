import { useState } from "react";
import {
  useReceivedMeters,
  useCreateReceivedMeter,
  useParties,
} from "@/hooks/use-erp-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERPTable } from "@/components/shared/ERPTable";

import { TableRow, TableCell } from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function ReceivedMeter() {
  const { isAdmin } = useAuth();

  const { data: meters, isLoading } = useReceivedMeters();
  const { data: parties } = useParties();

  const receivedMeters = Array.isArray(meters) ? meters : [];

  const createMutation = useCreateReceivedMeter();

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    partyId: "",
    meter: "",
    pieces: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        partyId: Number(formData.partyId),
        meter: Number(formData.meter),
        pieces: Number(formData.pieces),
      });

      setOpen(false);

      setFormData({
        partyId: "",
        meter: "",
        pieces: "",
      });
    } catch (error) {
      console.error("Failed to save received meter:", error);
    }
  };

  const getPartyName = (id: number) =>
    parties?.find((p) => p.id === id)?.partyName || "Unknown";

  return (
    <div className="space-y-6">

      {/* ---------------- HEADER ---------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Received Meters
          </h1>

          <p className="text-muted-foreground">
            Log of all cloth meters received from parties.
          </p>
        </div>

        {/* ---------------- ADD BUTTON ---------------- */}

        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                + Add Received Meter
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">

              <DialogHeader>
                <DialogTitle>
                  Add Received Meter
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* PARTY */}

                <div className="space-y-2">
                  <Label>Select Party</Label>

                  <Select
                    value={formData.partyId}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        partyId: v,
                      })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Party" />
                    </SelectTrigger>

                    <SelectContent>
                      {parties?.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id.toString()}
                        >
                          {p.partyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* METER */}

                <div className="space-y-2">
                  <Label>Received Meter</Label>

                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.meter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meter: e.target.value,
                      })
                    }
                    className="rounded-none"
                    placeholder="Enter meter"
                  />
                </div>

                {/* PIECES */}

                <div className="space-y-2">
                  <Label>Total No. of Pieces</Label>

                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.pieces}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pieces: e.target.value,
                      })
                    }
                    className="rounded-none"
                    placeholder="Enter number of pieces"
                  />
                </div>

                {/* SAVE */}

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {createMutation.isPending
                    ? "Saving..."
                    : "Save Entry"}
                </Button>

              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ---------------- TABLE ---------------- */}

      <div className="rounded-lg border bg-card">

        <ERPTable
          headers={[
            "Date",
            "Time",
            "Party",
            "Meter",
            "Pieces",
          ]}
        >

          {/* LOADING */}

          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center"
              >
                Loading...
              </TableCell>
            </TableRow>

          ) : receivedMeters.length === 0 ? (

            /* EMPTY */

            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center"
              >
                No records found.
              </TableCell>
            </TableRow>

          ) : (

            /* DATA */

            receivedMeters.map((m) => (
              <TableRow
                key={m.id}
                className="hover:bg-muted/50"
              >

                {/* DATE */}

                <TableCell>
                  {format(
                    new Date(m.createdAt),
                    "dd-MMM-yyyy"
                  )}
                </TableCell>

                {/* TIME */}

                <TableCell>
                  {format(
                    new Date(m.createdAt),
                    "hh:mm a"
                  )}
                </TableCell>

                {/* PARTY */}

                <TableCell className="font-bold capitalize">
                  {getPartyName(m.partyId)}
                </TableCell>

                {/* METER */}

                <TableCell className="font-bold text-primary">
                  {m.meter} Mtr
                </TableCell>

                {/* PIECES */}

                <TableCell className="font-bold text-primary">
                  {m.pieces} Pcs
                </TableCell>

              </TableRow>
            ))
          )}

        </ERPTable>

      </div>
    </div>
  );
}