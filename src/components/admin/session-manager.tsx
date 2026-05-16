"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Play, Plus, Square, TimerReset } from "lucide-react";

import { CountdownText } from "@/components/common/countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getSetupDisplayName } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { useCafeStore } from "@/store/cafe-store";

type SessionRow = {
  id: string;
  status: string;
  startedAt: string;
  endsAt: string;
  billedAmount: string | number;
  paidAmount: string | number;
  setup: { id: string; name: string; type: string };
  customer?: { name?: string | null; phone?: string | null } | null;
};

export function SessionManager() {
  const { setups, fetchAvailability, fetchDashboard, subscribeAdmin } = useCafeStore();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [form, setForm] = useState({
    setupId: "",
    customerName: "",
    customerPhone: "",
    durationMinutes: "60",
    paidAmount: "0",
    paymentMethod: "CASH"
  });

  async function fetchSessions() {
    const response = await fetch("/api/sessions?status=ACTIVE", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as { sessions: SessionRow[] };
    setSessions(data.sessions);
  }

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
    const unsubscribe = subscribeAdmin();
    const interval = window.setInterval(fetchSessions, 15_000);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [fetchAvailability, subscribeAdmin]);

  async function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupId: form.setupId,
        customerName: form.customerName || undefined,
        customerPhone: form.customerPhone || undefined,
        durationMinutes: Number(form.durationMinutes),
        paidAmount: Number(form.paidAmount),
        paymentMethod: Number(form.paidAmount) > 0 ? form.paymentMethod : undefined
      })
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Unable to start session.");
      return;
    }

    toast.success("Session started.");
    setForm({ ...form, customerName: "", customerPhone: "", paidAmount: "0" });
    fetchSessions();
    fetchAvailability();
    fetchDashboard();
  }

  async function action(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Action failed.");
      return;
    }
    toast.success("Session updated.");
    fetchSessions();
    fetchAvailability();
    fetchDashboard();
  }

  const availableSetups = setups.filter((setup) => setup.displayStatus === "AVAILABLE");

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="xl:sticky xl:top-24 xl:self-start">
        <CardHeader>
          <CardTitle>Walk-in start</CardTitle>
          <p className="text-sm text-muted-foreground">Create a customer session with cash/UPI tracking.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={start}>
            <div className="space-y-2">
              <Label>Available setup</Label>
              <Select value={form.setupId} onValueChange={(setupId) => setForm({ ...form, setupId })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select setup" />
                </SelectTrigger>
                <SelectContent>
                  {availableSetups.map((setup) => (
                    <SelectItem key={setup.id} value={setup.id}>
                      {getSetupDisplayName(setup)} · ₹{setup.hourlyPrice}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Input value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={form.durationMinutes} onValueChange={(durationMinutes) => setForm({ ...form, durationMinutes })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paid now</Label>
                <Input value={form.paidAmount} type="number" onChange={(event) => setForm({ ...form, paidAmount: event.target.value })} />
              </div>
            </div>
            <Select value={form.paymentMethod} onValueChange={(paymentMethod) => setForm({ ...form, paymentMethod })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" disabled={!form.setupId}>
              <Play />
              Start session
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{getSetupDisplayName(session.setup)}</h3>
                  <Badge variant="outline">{session.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                  <span>{session.customer?.name || session.customer?.phone || "Walk-in"}</span>
                  <span>Ends in <CountdownText endsAt={session.endsAt} /></span>
                  <span>Billed {formatINR(session.billedAmount)}</span>
                  <span>Paid {formatINR(session.paidAmount)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => action(session.id, { action: "EXTEND", minutes: 15 })}>
                  <TimerReset />
                  15m
                </Button>
                <Button variant="outline" size="sm" onClick={() => action(session.id, { action: "EXTEND", minutes: 30 })}>
                  <Plus />
                  30m
                </Button>
                <Button variant="destructive" size="sm" onClick={() => action(session.id, { action: "END" })}>
                  <Square />
                  End
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">No active sessions right now.</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
