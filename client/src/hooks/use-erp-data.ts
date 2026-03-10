import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";


/* ---------------- FETCH HELPER ---------------- */

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
}

/* ---------------- MUTATION HELPER ---------------- */

async function mutator<T, R>(url: string, method: string, data: T): Promise<R> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    let errorMessage = "Operation failed";

    try {
      const errorData = await res.json();

      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData
      ) {
        errorMessage = String((errorData as any).message);
      }
    } catch {
      errorMessage = "Server error";
    }

    throw new Error(errorMessage);
  }

  return await res.json();
}

/* ---------------- PARTIES ---------------- */

export function useParties() {
  return useQuery({
    queryKey: [api.parties.list.path],
    queryFn: () => fetcher(api.parties.list.path),
  });
}

export function useCreateParty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof api.parties.create.input>) =>
      mutator(api.parties.create.path, api.parties.create.method, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.parties.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

/* ---------------- RECEIVED METERS ---------------- */

export function useReceivedMeters() {
  return useQuery({
    queryKey: [api.receivedMeters.list.path],
    queryFn: () => fetcher(api.receivedMeters.list.path),
  });
}

export function useCreateReceivedMeter() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof api.receivedMeters.create.input>) =>
      mutator(api.receivedMeters.create.path, api.receivedMeters.create.method, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.receivedMeters.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      qc.invalidateQueries({ queryKey: [api.statement.get.path] });
    },
  });
}

/* ---------------- DELIVERY BAGS ---------------- */

export function useDeliveryBags() {
  return useQuery({
    queryKey: [api.deliveryBags.list.path],
    queryFn: () => fetcher(api.deliveryBags.list.path),
  });
}

export function useCreateDeliveryBag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof api.deliveryBags.create.input>) =>
      mutator(api.deliveryBags.create.path, api.deliveryBags.create.method, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.deliveryBags.list.path] });
      qc.invalidateQueries({ queryKey: [api.statement.get.path] });
    },
  });
}

/* ---------------- DELIVERY BEAMS ---------------- */

export function useDeliveryBeams() {
  return useQuery({
    queryKey: [api.deliveryBeams.list.path],
    queryFn: () => fetcher(api.deliveryBeams.list.path),
  });
}

export function useCreateDeliveryBeam() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof api.deliveryBeams.create.input>) =>
      mutator(api.deliveryBeams.create.path, api.deliveryBeams.create.method, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.deliveryBeams.list.path] });
      qc.invalidateQueries({ queryKey: [api.statement.get.path] });
    },
  });
}

/* ---------------- SALARIES ---------------- */

export function useSalaries() {
  return useQuery({
    queryKey: [api.salaries.list.path],
    queryFn: () => fetcher(api.salaries.list.path),
  });
}

export function useCreateSalary() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof api.salaries.create.input>) =>
      mutator(api.salaries.create.path, api.salaries.create.method, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.salaries.list.path] });
      qc.invalidateQueries({ queryKey: [api.parties.list.path] });
      qc.invalidateQueries({ queryKey: [api.statement.get.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

/* ---------------- ADVANCES ---------------- */

export function useAdvances() {
  return useQuery({
    queryKey: [api.advances.list.path],
    queryFn: () => fetcher(api.advances.list.path),
  });
}

export function useCreateAdvance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof api.advances.create.input>) =>
      mutator(api.advances.create.path, api.advances.create.method, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.advances.list.path] });
      qc.invalidateQueries({ queryKey: [api.parties.list.path] });
      qc.invalidateQueries({ queryKey: [api.statement.get.path] });
    },
  });
}

/* ---------------- NOTES ---------------- */

export function useNotes() {
  return useQuery({
    queryKey: [api.notes.list.path],
    queryFn: () => fetcher(api.notes.list.path),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: z.infer<typeof api.notes.create.input>) =>
      mutator(api.notes.create.path, api.notes.create.method, data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.notes.list.path] });
    },
  });
}

/* ---------------- DASHBOARD ---------------- */

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: () => fetcher(api.dashboard.stats.path),
  });
}

/* ---------------- STATEMENT ---------------- */

export function useStatement(partyId?: number) {
  return useQuery({
    queryKey: [api.statement.get.path, partyId],
    queryFn: () => {
      const url = buildUrl(api.statement.get.path, { partyId: partyId! });
      return fetcher(url);
    },
    enabled: !!partyId,
  });
}

/* ---------------- REPORTS ---------------- */

export function useWeeklyReport() {
  return useQuery({
    queryKey: [api.reports.weekly.path],
    queryFn: () => fetcher(api.reports.weekly.path),
  });
}

export function useMonthlyReport() {
  return useQuery({
    queryKey: [api.reports.monthly.path],
    queryFn: () => fetcher(api.reports.monthly.path),
  });
}
export function useDeleteParty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/parties/${id}`, {
        method: "DELETE",
        credentials: "include"
      }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.parties.list.path] });
    }
  });
}