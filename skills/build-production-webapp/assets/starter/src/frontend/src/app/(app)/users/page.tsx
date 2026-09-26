"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { dateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersPage() {
  const { data: session } = authClient.useSession();
  const client = useQueryClient();
  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await authClient.admin.listUsers({ query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" } });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: session?.user.role === "admin",
  });
  const createUser = useMutation({
    mutationFn: async (input: { username: string; password: string }) => {
      const username = input.username.trim();
      const result = await authClient.admin.createUser({
        email: `${username.toLowerCase()}@production-webapp.internal`,
        name: username,
        password: input.password,
        role: "user",
        data: { username, displayUsername: username },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }),
  });

  if (session?.user.role !== "admin") return <Empty><EmptyHeader><EmptyTitle>Restricted access</EmptyTitle><EmptyDescription>Only administrators can manage users.</EmptyDescription></EmptyHeader></Empty>;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    createUser.mutate({ username: String(data.get("username")), password: String(data.get("password")) }, { onSuccess: () => form.reset() });
  }

  return (
    <>
      <header><h1 className="text-3xl font-semibold tracking-tight">Users</h1><p className="text-muted-foreground">Administrators create accounts; public registration is disabled.</p></header>
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card><CardHeader><CardTitle>New user</CardTitle><CardDescription>Create a temporary username and password.</CardDescription></CardHeader><CardContent><form onSubmit={submit}><FieldGroup><Field><FieldLabel htmlFor="username">Username</FieldLabel><Input id="username" name="username" minLength={3} maxLength={30} pattern="[A-Za-z0-9_.]+" required /></Field><Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" minLength={8} maxLength={128} required /></Field><Button type="submit" disabled={createUser.isPending}>Create user</Button></FieldGroup></form></CardContent></Card>
        <Card><CardHeader><CardTitle>Registered users</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{users.data?.users.map((user) => <TableRow key={user.id}><TableCell>{user.name}</TableCell><TableCell><Badge variant="secondary">{user.role ?? "user"}</Badge></TableCell><TableCell>{dateTime(user.createdAt)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
      </div>
    </>
  );
}
