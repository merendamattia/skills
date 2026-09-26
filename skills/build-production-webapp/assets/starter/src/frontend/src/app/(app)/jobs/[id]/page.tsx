"use client";

import { useParams } from "next/navigation";
import { useCancelJob, useJob } from "@/hooks/api";
import { dateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const cancellable = new Set(["PENDING", "QUEUED", "RUNNING", "RETRYING"]);

export default function JobPage() {
  const id = String(useParams<{ id: string }>().id);
  const job = useJob(id);
  const cancel = useCancelJob(id);
  if (job.isPending) return <Spinner />;
  if (!job.data) return <p role="alert">Job could not be loaded.</p>;
  return (
    <>
      <header className="flex flex-wrap items-center gap-3"><div className="mr-auto"><h1 className="text-3xl font-semibold tracking-tight">Job</h1><p className="font-mono text-sm text-muted-foreground">{job.data.id}</p></div><Badge variant="secondary">{job.data.status}</Badge>{cancellable.has(job.data.status) ? <Button variant="outline" onClick={() => cancel.mutate()} disabled={cancel.isPending}>Cancel</Button> : null}</header>
      <Card><CardHeader><CardTitle>Lifecycle</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm sm:grid-cols-2"><p>Created: {dateTime(job.data.createdAt)}</p><p>Queued: {job.data.queuedAt ? dateTime(job.data.queuedAt) : "—"}</p><p>Started: {job.data.startedAt ? dateTime(job.data.startedAt) : "—"}</p><p>Completed: {job.data.completedAt ? dateTime(job.data.completedAt) : "—"}</p><p>Attempts: {job.data.attempts}</p><p>Worker: {job.data.workerId ?? "—"}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Result</CardTitle></CardHeader><CardContent><pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(job.data.result ?? job.data.errorMessage ?? job.data.input, null, 2)}</pre></CardContent></Card>
    </>
  );
}
