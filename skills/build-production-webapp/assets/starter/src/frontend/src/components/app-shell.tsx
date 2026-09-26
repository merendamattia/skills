"use client";

import { LayoutDashboard, ListTodo, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: ListTodo },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!isPending && !session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isPending, pathname, router, session]);

  if (isPending || !session) return <main className="grid min-h-screen place-items-center"><Spinner /></main>;
  const navigation = session.user.role === "admin"
    ? [...links, { href: "/users", label: "Users", icon: Users }]
    : links;

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="fixed top-2 left-2 -translate-y-20 rounded-lg bg-card px-3 py-2 focus:translate-y-0">Skip to content</a>
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-2 px-4">
          <Link href="/" className="mr-auto font-semibold">Production Web App</Link>
          <nav className="flex gap-1" aria-label="Main navigation">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={cn(buttonVariants({ variant: "ghost" }), pathname === href && "bg-muted")}>
                <Icon data-icon="inline-start" /> {label}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={async () => {
            await authClient.signOut();
            router.replace("/login");
          }}><LogOut /></Button>
        </div>
      </header>
      <main id="main-content" className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">{children}</main>
    </div>
  );
}
