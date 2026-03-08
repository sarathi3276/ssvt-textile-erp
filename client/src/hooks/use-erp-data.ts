import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Fetcher helper
async function fetcher<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return schema.parse(await res.json());
}

// Mutator helper
async function mutator<T, R>(url: string, method: string, data: T, responseSchema: z.ZodType<R>): Promise<R> {
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
      if (typeof errorData === "object" && errorData !== null && "message" in errorData) {
        errorMessage = String(errorData.message);
      }
    } catch (e) {
      // Failed to parse JSON error response
    }
    throw new Error(errorMessage);
  }
  return responseSchema.parse(await res.json());
}

// PARTIES
export function useParties() {
  return useQuery({
    queryKey: [api.parties.list.path],
    queryFn: () => fetcher(api.parties.list.path, api.parties.list.responses[200]),
  });
}

export function useCreateParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.parties.create.input>) => 
      mutator(api.parties.create.path, api.parties.create.method, data, api.parties.create.responses[201]),
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.parties.list.path] }),
  });
}

// RECEIVED METERS
export function useReceivedMeters() {
  return useQuery({
    queryKey: [api.receivedMeters.list.path],
    queryFn: () => fetcher(api.receivedMeters.list.path, api.receivedMeters.list.responses[200]),
  });
}

export function useCreateReceivedMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.receivedMeters.create.input>) => 
      mutator(api.receivedMeters.create.path, api.receivedMeters.create.method, data, api.receivedMeters.create.responses[201]),
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.receivedMeters.list.path] }),
  });
}

// DELIVERY BAGS
export function useDeliveryBags() {
  return useQuery({
    queryKey: [api.deliveryBags.list.path],
    queryFn: () => fetcher(api.deliveryBags.list.path, api.deliveryBags.list.responses[200]),
  });
}

export function useCreateDeliveryBag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.deliveryBags.create.input>) => 
      mutator(api.deliveryBags.create.path, api.deliveryBags.create.method, data, api.deliveryBags.create.responses[201]),
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.deliveryBags.list.path] }),
  });
}

// DELIVERY BEAMS
export function useDeliveryBeams() {
  return useQuery({
    queryKey: [api.deliveryBeams.list.path],
    queryFn: () => fetcher(api.deliveryBeams.list.path, api.deliveryBeams.list.responses[200]),
  });
}

export function useCreateDeliveryBeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.deliveryBeams.create.input>) => 
      mutator(api.deliveryBeams.create.path, api.deliveryBeams.create.method, data, api.deliveryBeams.create.responses[201]),
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.deliveryBeams.list.path] }),
  });
}

// SALARIES
export function useSalaries() {
  return useQuery({
    queryKey: [api.salaries.list.path],
    queryFn: () => fetcher(api.salaries.list.path, api.salaries.list.responses[200]),
  });
}

export function useCreateSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.salaries.create.input>) => 
      mutator(api.salaries.create.path, api.salaries.create.method, data, api.salaries.create.responses[201]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.salaries.list.path] });
      qc.invalidateQueries({ queryKey: [api.parties.list.path] }); // advance balance updates
    },
  });
}

// ADVANCES
export function useAdvances() {
  return useQuery({
    queryKey: [api.advances.list.path],
    queryFn: () => fetcher(api.advances.list.path, api.advances.list.responses[200]),
  });
}

export function useCreateAdvance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.advances.create.input>) => 
      mutator(api.advances.create.path, api.advances.create.method, data, api.advances.create.responses[201]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.advances.list.path] });
      qc.invalidateQueries({ queryKey: [api.parties.list.path] });
    },
  });
}

// NOTES
export function useNotes() {
  return useQuery({
    queryKey: [api.notes.list.path],
    queryFn: () => fetcher(api.notes.list.path, api.notes.list.responses[200]),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.notes.create.input>) => 
      mutator(api.notes.create.path, api.notes.create.method, data, api.notes.create.responses[201]),
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.notes.list.path] }),
  });
}

// DASHBOARD STATS
export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: () => fetcher(api.dashboard.stats.path, api.dashboard.stats.responses[200]),
  });
}

// STATEMENT
export function useStatement(partyId?: number) {
  return useQuery({
    queryKey: [api.statement.get.path, partyId],
    queryFn: () => {
      const url = buildUrl(api.statement.get.path, { partyId: partyId! });
      return fetcher(url, api.statement.get.responses[200]);
    },
    enabled: !!partyId,
  });
}

// REPORTS
export function useWeeklyReport() {
  return useQuery({
    queryKey: [api.reports.weekly.path],
    queryFn: () => fetcher(api.reports.weekly.path, api.reports.weekly.responses[200]),
  });
}

export function useMonthlyReport() {
  return useQuery({
    queryKey: [api.reports.monthly.path],
    queryFn: () => fetcher(api.reports.monthly.path, api.reports.monthly.responses[200]),
  });
}
