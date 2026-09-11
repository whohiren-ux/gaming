"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Monitor,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  approveMembershipRequestAction,
  rejectMembershipRequestAction
} from "@/actions/admin";
import { formatINR } from "@/lib/money";

type Request = {
  id: string;
  preferredDate: string;
  deviceType: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  plan: {
    name: string;
    price: number | string;
    includedMinutes: number;
    playerCount: number;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
};

export function MembershipRequestsManager({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [detailRequest, setDetailRequest] = useState<Request | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

  function flash(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function handleApprove(requestId: string) {
    startTransition(async () => {
      try {
        await approveMembershipRequestAction(requestId);
        flash("success", "Request approved and membership activated.");
        router.refresh();
      } catch (e: unknown) {
        flash("error", e instanceof Error ? e.message : "Failed to approve.");
      }
    });
  }

  function handleReject(requestId: string) {
    startTransition(async () => {
      try {
        await rejectMembershipRequestAction(requestId, rejectNote || undefined);
        setRejectId(null);
        setRejectNote("");
        flash("success", "Request rejected.");
        router.refresh();
      } catch (e: unknown) {
        flash("error", e instanceof Error ? e.message : "Failed to reject.");
      }
    });
  }

  const pending = requests.filter((r) => r.status === "PENDING");
  const processed = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
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

      <div>
        <h1 className="text-2xl font-bold text-white">Membership Requests</h1>
        <p className="text-sm text-muted-foreground">{pending.length} pending request{pending.length !== 1 ? "s" : ""}</p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</h2>
          {pending.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{req.plan.name}</h3>
                      <Badge variant="outline">{req.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {req.user.name || req.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(req.preferredDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="size-3" />
                        {req.deviceType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDetailRequest(req)}>
                      <Eye className="size-3.5" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req.id)}
                      disabled={isPending}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      {isPending ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle className="size-3.5" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectId(req.id)}
                      disabled={isPending}
                      className="gap-1"
                    >
                      <XCircle className="size-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Processed</h2>
          {processed.map((req) => (
            <Card key={req.id} className="opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{req.plan.name}</h3>
                      <Badge variant={req.status === "APPROVED" ? "success" : "destructive"}>{req.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {req.user.name || req.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setDetailRequest(req)}>
                    <Eye className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No membership requests yet.
          </CardContent>
        </Card>
      )}

      <Dialog open={!!detailRequest} onOpenChange={() => setDetailRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {detailRequest && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{detailRequest.plan.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-semibold">{formatINR(detailRequest.plan.price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Players</span><span className="font-semibold">{detailRequest.plan.playerCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{Math.floor(detailRequest.plan.includedMinutes / 60)} hours</span></div>
              <div className="border-t border-white/10 pt-2 flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-semibold">{detailRequest.user.name || detailRequest.user.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-semibold">{detailRequest.user.email}</span></div>
              {detailRequest.user.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-semibold">{detailRequest.user.phone}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Preferred date</span><span className="font-semibold">{new Date(detailRequest.preferredDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="font-semibold">{detailRequest.deviceType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={detailRequest.status === "APPROVED" ? "success" : detailRequest.status === "REJECTED" ? "destructive" : "outline"}>{detailRequest.status}</Badge></div>
              {detailRequest.adminNote && <div className="flex justify-between"><span className="text-muted-foreground">Admin note</span><span className="font-semibold">{detailRequest.adminNote}</span></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectId} onOpenChange={() => { setRejectId(null); setRejectNote(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>Optionally add a reason for rejection.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason (optional)"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectId(null); setRejectNote(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={() => rejectId && handleReject(rejectId)} disabled={isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
