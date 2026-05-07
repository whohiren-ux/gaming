"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(data.error || "Unable to send message.");
      return;
    }

    toast.success("Message sent to the cafe desk.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="p-5">
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </div>
          <Button disabled={loading}>{loading ? "Sending..." : "Send message"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
