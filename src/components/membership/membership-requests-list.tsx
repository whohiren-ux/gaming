"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Monitor, CheckCircle2, XCircle, Hourglass } from "lucide-react";

type Request = {
  id: string;
  preferredDate: string;
  deviceType: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  plan: {
    name: string;
    price: number;
    includedMinutes: number;
  };
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  PENDING: { icon: Hourglass, color: "text-neon-amber", label: "Pending" },
  APPROVED: { icon: CheckCircle2, color: "text-neon-green", label: "Approved" },
  REJECTED: { icon: XCircle, color: "text-red-400", label: "Rejected" }
};

export function MembershipRequestsList({ requests }: { requests: Request[] }) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          You haven't made any membership requests yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const config = statusConfig[req.status] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
          <Card key={req.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{req.plan.name}</h3>
                    <Badge variant={req.status === "APPROVED" ? "success" : req.status === "REJECTED" ? "destructive" : "outline"}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(req.preferredDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Monitor className="size-3" />
                      {req.deviceType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {req.adminNote && (
                    <p className="mt-1 text-xs text-muted-foreground">Note: {req.adminNote}</p>
                  )}
                </div>
                <Icon className={`size-5 shrink-0 ${config.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
