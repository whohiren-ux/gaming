"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";

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

type SetupRow = {
  id: string;
  stationCode: string;
  name: string;
  type: "PS5" | "PS4" | "GAMING_PC";
  hourlyPrice: number;
  status: string;
  floor: string;
  displayOrder: number;
  bufferMinutes: number;
  isBookable: boolean;
};

type SetupForm = {
  stationCode: string;
  name: string;
  type: SetupRow["type"];
  hourlyPrice: string;
  floor: string;
  displayOrder: string;
  bufferMinutes: string;
};

const emptySetup: SetupForm = {
  stationCode: "",
  name: "",
  type: "PS5",
  hourlyPrice: "350",
  floor: "Main Floor",
  displayOrder: "0",
  bufferMinutes: "10"
};

export function SetupManager({ initialSetups }: { initialSetups: SetupRow[] }) {
  const [setups, setSetups] = useState(initialSetups);
  const [form, setForm] = useState<SetupForm>(emptySetup);

  async function createSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/setups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        hourlyPrice: Number(form.hourlyPrice),
        displayOrder: Number(form.displayOrder),
        bufferMinutes: Number(form.bufferMinutes)
      })
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Unable to create setup.");
      return;
    }

    toast.success("Setup created.");
    setSetups((current) => [...current, { ...data.setup, hourlyPrice: Number(data.setup.hourlyPrice) }]);
    setForm(emptySetup);
  }

  async function updateSetup(id: string, patch: Partial<SetupRow>) {
    const response = await fetch(`/api/setups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Unable to update setup.");
      return;
    }

    setSetups((current) =>
      current.map((setup) => (setup.id === id ? { ...setup, ...data.setup, hourlyPrice: Number(data.setup.hourlyPrice) } : setup))
    );
    toast.success("Setup updated.");
  }

  async function disableSetup(id: string) {
    const response = await fetch(`/api/setups/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Unable to disable setup.");
      return;
    }
    setSetups((current) => current.map((setup) => (setup.id === id ? { ...setup, status: "MAINTENANCE", isBookable: false } : setup)));
    toast.success("Setup disabled.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card className="xl:sticky xl:top-24 xl:self-start">
        <CardHeader>
          <CardTitle>New setup</CardTitle>
          <p className="text-sm text-muted-foreground">Add PS5, PS4, or PC stations with pricing and buffer rules.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={createSetup}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Station code</Label>
                <Input value={form.stationCode} onChange={(event) => setForm({ ...form, stationCode: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(type) => setForm({ ...form, type: type as SetupRow["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PS5">PS5</SelectItem>
                    <SelectItem value="PS4">PS4</SelectItem>
                    <SelectItem value="GAMING_PC">Gaming PC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>₹/hr</Label>
                <Input value={form.hourlyPrice} type="number" onChange={(event) => setForm({ ...form, hourlyPrice: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input value={form.displayOrder} type="number" onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Buffer</Label>
                <Input value={form.bufferMinutes} type="number" onChange={(event) => setForm({ ...form, bufferMinutes: event.target.value })} />
              </div>
            </div>
            <Button className="w-full">
              <Plus />
              Add setup
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {setups.map((setup) => (
          <Card key={setup.id}>
            <CardContent className="grid gap-4 p-5 xl:grid-cols-[1fr_160px_160px_auto] xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{setup.name}</h3>
                  <Badge variant="outline">{setup.type.replace("_", " ")}</Badge>
                  <Badge variant={setup.isBookable ? "success" : "muted"}>{setup.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{setup.stationCode} · {setup.floor}</p>
              </div>
              <Input
                type="number"
                defaultValue={setup.hourlyPrice}
                onBlur={(event) => updateSetup(setup.id, { hourlyPrice: Number(event.target.value) })}
              />
              <Select defaultValue={setup.status} onValueChange={(status) => updateSetup(setup.id, { status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => updateSetup(setup.id, { isBookable: !setup.isBookable })} aria-label="Toggle bookable">
                  <Save />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => disableSetup(setup.id)} aria-label="Disable setup">
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
