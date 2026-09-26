"use client";

import Link from "next/link";
import { type FormEvent } from "react";
import { useCreateJob, useJobs } from "@/hooks/api";
import { dateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function JobsPage() {
  const jobs = useJobs();
  const createJob = useCreateJob();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    createJob.mutate({ message: String(new FormData(form).get("message")) }, { onSuccess: () => form.reset() });
  }
  return (
    <>
      <header><h1 className="text-3xl font-semibold tracking-tight">Jobs</h1><p className="text-muted-foreground">Durable state from request through worker completion.</p></header>
      <Card><CardHeader><CardTitle>Queue example job</CardTitle><CardDescription>The request returns while work remains queued.</CardDescription></CardHeader><CardContent><form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="message">Message</FieldLabel><Input id="message" name="message" maxLength={1000} required /></Field><Button type="submit" disabled={createJob.isPending}>Queue job</Button></FieldGroup></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Recent jobs</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead>Attempts</TableHead></TableRow></TableHeader><TableBody>{jobs.data?.map((job) => <TableRow key={job.id}><TableCell><Link href={`/jobs/${job.id}`}><Badge variant="secondary">{job.status}</Badge></Link></TableCell><TableCell>{dateTime(job.createdAt)}</TableCell><TableCell>{job.attempts}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </>
  );
}
