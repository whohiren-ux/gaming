"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  X,
  Save,
  Users,
  Clock,
  Percent,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  createMembershipPlanAction,
  updateMembershipPlanAction,
  toggleMembershipPlanActiveAction,
  deleteMembershipPlanAction,
  assignMembershipAction
} from "@/actions/admin";
import { formatINR } from "@/lib/money";

type Plan = {
  id: string;
  name: string;
  type: string;
  price: number;
  includedMinutes: number;
  discountPercent: number;
  priorityBooking: boolean;
  maxDailyMinutes: number | null;
  isActive: boolean;
  description: string | null;
  memberships: { id: string; status: string; remainingMinutes: number; user: { name: string | null; email: string | null } }[];
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
};

export function MembershipManager({ plans, users }: { plans: Plan[]; users: User[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function flash(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function handleCreatePlan(formData: FormData) {
    startTransition(async () => {
      try {
        await createMembershipPlanAction(formData);
        flash("success", "Plan created successfully");
        router.refresh();
      } catch (e: unknown) {
        flash("error", e instanceof Error ? e.message : "Failed to create plan");
      }
    });
  }

  function handleUpdatePlan(planId: string, formData: FormData) {
    startTransition(async () => {
      try {
        await updateMembershipPlanAction(planId, formData);
        setEditingId(null);
        flash("success", "Plan updated successfully");
        router.refresh();
      } catch (e: unknown) {
        flash("error", e instanceof Error ? e.message : "Failed to update plan");
      }
    });
  }

  function handleToggleActive(planId: string) {
    startTransition(async () => {
      try {
        await toggleMembershipPlanActiveAction(planId);
        flash("success", "Plan status toggled");
        router.refresh();
      } catch (e: unknown) {
        flash("error", e instanceof Error ? e.message : "Failed to toggle plan");
      }
    });
  }

  function handleDeletePlan(planId: string) {
    startTransition(async () => {
      try {
        await deleteMembershipPlanAction(planId);
        setConfirmDelete(null);
        flash("success", "Plan deleted successfully");
        router.refresh();
      } catch (e: unknown) {
        flash("error", e instanceof Error ? e.message : "Failed to delete plan");
      }
    });
  }

  function handleAssign(formData: FormData) {
    startTransition(async () => {
      try {
        await assignMembershipAction(formData);
        setShowAssign(false);
        setAssignPlanId("");
        setAssignUserId("");
        flash("success", "Membership assigned successfully");
        router.refresh();
      } catch (e: unknown) {
        flash("error", e instanceof Error ? e.message : "Failed to assign membership");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {message && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* CREATE FORM */}
        <Card className="xl:sticky xl:top-24 xl:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="size-5 text-yellow-400" />
              Create membership plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <Label>Plan name</Label>
                <Input name="name" placeholder="e.g. Monthly Basic" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="type" defaultValue="MONTHLY">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="HOURS">Hours Pack</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (INR)</Label>
                  <Input name="price" type="number" min="0" step="1" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Included minutes</Label>
                  <Input name="includedMinutes" type="number" min="0" required />
                  <p className="text-xs text-muted-foreground">
                    {">"}0 = {">"}0 hours included
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Discount %</Label>
                  <Input name="discountPercent" type="number" min="0" max="90" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max daily minutes (optional)</Label>
                <Input name="maxDailyMinutes" type="number" min="0" placeholder="Unlimited" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="priorityBooking" type="checkbox" className="size-4 rounded" />
                Priority booking access
              </label>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" placeholder="Plan benefits..." />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : "Create plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* PLANS LIST */}
        <div className="space-y-4">
          {/* Assign membership button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAssign(!showAssign)}
              className="gap-2"
            >
              <UserPlus className="size-4" />
              Assign membership to user
            </Button>
          </div>

          {/* Assign form */}
          {showAssign && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <UserPlus className="size-4 text-green-400" />
                    Assign membership
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setShowAssign(false)}>
                    <X className="size-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={handleAssign} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Select user</Label>
                      <select
                        name="userId"
                        value={assignUserId}
                        onChange={(e) => setAssignUserId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-ink-950/70 px-3 py-2 text-sm text-foreground"
                        required
                      >
                        <option value="">Choose user...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name || u.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Select plan</Label>
                      <select
                        name="planId"
                        value={assignPlanId}
                        onChange={(e) => setAssignPlanId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-ink-950/70 px-3 py-2 text-sm text-foreground"
                        required
                      >
                        <option value="">Choose plan...</option>
                        {plans.filter((p) => p.isActive).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {formatINR(p.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending || !assignUserId || !assignPlanId}>
                    Assign now
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Plan cards */}
          {plans.map((plan) => {
            const activeMembers = plan.memberships.filter((m) => m.status === "ACTIVE");
            const isEditing = editingId === plan.id;

            return (
              <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
                <CardContent className="p-5">
                  {isEditing ? (
                    /* EDIT MODE */
                    <form
                      action={(fd) => handleUpdatePlan(plan.id, fd)}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-muted-foreground">Editing plan</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Plan name</Label>
                        <Input name="name" defaultValue={plan.name} required />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select name="type" defaultValue={plan.type}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="HOURS">Hours Pack</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Price (INR)</Label>
                          <Input name="price" type="number" min="0" defaultValue={plan.price} required />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Included minutes</Label>
                          <Input name="includedMinutes" type="number" min="0" defaultValue={plan.includedMinutes} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Discount %</Label>
                          <Input name="discountPercent" type="number" min="0" max="90" defaultValue={plan.discountPercent} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Max daily minutes (optional)</Label>
                        <Input name="maxDailyMinutes" type="number" min="0" defaultValue={plan.maxDailyMinutes ?? ""} />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input name="priorityBooking" type="checkbox" defaultChecked={plan.priorityBooking} className="size-4 rounded" />
                        Priority booking access
                      </label>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea name="description" defaultValue={plan.description ?? ""} />
                      </div>
                      <Button type="submit" className="w-full gap-2" disabled={isPending}>
                        <Save className="size-4" />
                        Save changes
                      </Button>
                    </form>
                  ) : (
                    /* VIEW MODE */
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                          {!plan.isActive && (
                            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                              Inactive
                            </span>
                          )}
                          {plan.priorityBooking && (
                            <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {Math.floor(plan.includedMinutes / 60)}h {plan.includedMinutes % 60}m
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Percent className="size-3.5" />
                            {plan.discountPercent}% off
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="size-3.5" />
                            {activeMembers.length} active
                          </span>
                          <span className="flex items-center gap-1.5">
                            <IndianRupee className="size-3.5" />
                            {plan.type}
                          </span>
                        </div>
                        {plan.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                        )}
                        {activeMembers.length > 0 && (
                          <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Active members:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeMembers.slice(0, 5).map((m) => (
                                <span key={m.id} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                                  {m.user.name || m.user.email}
                                </span>
                              ))}
                              {activeMembers.length > 5 && (
                                <span className="text-xs text-muted-foreground">+{activeMembers.length - 5} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-2xl font-black text-white">{formatINR(plan.price)}</p>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(plan.id)}
                            className="gap-1.5"
                          >
                            <Edit2 className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(plan.id)}
                            disabled={isPending}
                            className="gap-1.5"
                          >
                            {plan.isActive ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
                            {plan.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          {confirmDelete === plan.id ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePlan(plan.id)}
                                disabled={isPending}
                              >
                                Confirm
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmDelete(plan.id)}
                              className="gap-1.5 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {plans.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No membership plans yet. Create one to get started.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
