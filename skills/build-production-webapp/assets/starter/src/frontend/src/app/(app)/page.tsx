"use client";

import { type FormEvent } from "react";
import { useCreateItem, useDashboard, useItems } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const dashboard = useDashboard();
  const items = useItems();
  const createItem = useCreateItem();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name"));
    createItem.mutate(name, { onSuccess: () => form.reset() });
  }

  return (
    <>
      <header><h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1><p className="text-muted-foreground">Synchronous CRUD and asynchronous work share one durable backend.</p></header>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardHeader><CardTitle>Items</CardTitle><CardDescription>Short CRUD stays synchronous.</CardDescription></CardHeader><CardContent className="text-3xl font-semibold">{dashboard.data?.items ?? "—"}</CardContent></Card>
        <Card><CardHeader><CardTitle>Jobs</CardTitle><CardDescription>Runs execute only in BullMQ workers.</CardDescription></CardHeader><CardContent className="text-3xl font-semibold">{Object.values(dashboard.data?.jobs ?? {}).reduce((sum, count) => sum + count, 0)}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Example items</CardTitle><CardDescription>Replace this slice once the product has real synchronous CRUD.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="name">Item name</FieldLabel><Input id="name" name="name" maxLength={100} required /></Field><Button type="submit" disabled={createItem.isPending}>Create item</Button></FieldGroup></form>
          <ul className="flex flex-col gap-2">{items.data?.map((item) => <li key={item.id} className="rounded-lg border px-3 py-2">{item.name}</li>)}</ul>
        </CardContent>
      </Card>
    </>
  );
}
