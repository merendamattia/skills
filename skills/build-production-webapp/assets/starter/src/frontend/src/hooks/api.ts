"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { api, json } from "@/lib/api-client";

export type Dashboard = InferResponseType<typeof api.dashboard.$get, 200>;
export type Items = InferResponseType<typeof api.items.$get, 200>;
export type Jobs = InferResponseType<typeof api.jobs.$get, 200>;
export type Job = InferResponseType<typeof api.jobs[":id"]["$get"], 200>;
export type CreateJob = InferRequestType<typeof api.jobs.$post>["json"];
const active = new Set(["PENDING", "QUEUED", "RUNNING", "RETRYING"]);

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: async () => json<Dashboard>(await api.dashboard.$get()) });
}

export function useItems() {
  return useQuery({ queryKey: ["items"], queryFn: async () => json<Items>(await api.items.$get()) });
}

export function useCreateItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => json<Items[number]>(await api.items.$post({ json: { name } })),
    onSuccess: async () => Promise.all([
      client.invalidateQueries({ queryKey: ["items"] }),
      client.invalidateQueries({ queryKey: ["dashboard"] }),
    ]),
  });
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => json<Jobs>(await api.jobs.$get()),
    refetchInterval: (query) => (query.state.data as Jobs | undefined)?.some((job) => active.has(job.status)) ? 3_000 : false,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: async () => json<Job>(await api.jobs[":id"].$get({ param: { id } })),
    refetchInterval: (query) => active.has((query.state.data as Job | undefined)?.status ?? "") ? 3_000 : false,
  });
}

export function useCreateJob() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateJob) => json<Job>(await api.jobs.$post({ json: input })),
    onSuccess: async () => Promise.all([
      client.invalidateQueries({ queryKey: ["jobs"] }),
      client.invalidateQueries({ queryKey: ["dashboard"] }),
    ]),
  });
}

export function useCancelJob(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => json<Job>(await api.jobs[":id"].cancel.$post({ param: { id } })),
    onSuccess: async () => Promise.all([
      client.invalidateQueries({ queryKey: ["jobs"] }),
      client.invalidateQueries({ queryKey: ["jobs", id] }),
      client.invalidateQueries({ queryKey: ["dashboard"] }),
    ]),
  });
}
