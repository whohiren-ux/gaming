"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/money";

type Tournament = {
  id: string;
  title: string;
  game: string;
  startsAt: string;
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  status: string;
  description?: string | null;
  registrations: Array<{ id: string }>;
};

export function TournamentList({ tournaments }: { tournaments: Tournament[] }) {
  const { data: session } = useSession();
  const [gamerTags, setGamerTags] = useState<Record<string, string>>({});

  async function register(tournament: Tournament) {
    if (!session?.user) {
      toast.error("Please login before tournament registration.");
      return;
    }

    const response = await fetch(`/api/tournaments/${tournament.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gamerTag: gamerTags[tournament.id] || session.user.name || "Player" })
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Registration failed.");
      return;
    }

    toast.success("Tournament registration saved.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tournaments.map((tournament) => (
        <Card key={tournament.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="outline">{tournament.status}</Badge>
                <CardTitle className="mt-3">{tournament.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{tournament.game}</p>
              </div>
              <Trophy className="size-8 text-neon-amber" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">{tournament.description}</p>
            <div className="grid grid-cols-3 gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm">
              <div>
                <p className="text-muted-foreground">Starts</p>
                <p className="font-semibold text-white">{new Date(tournament.startsAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Entry</p>
                <p className="font-semibold text-white">{formatINR(tournament.entryFee)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Prize</p>
                <p className="font-semibold text-white">{formatINR(tournament.prizePool)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Gamer tag"
                value={gamerTags[tournament.id] ?? ""}
                onChange={(event) => setGamerTags({ ...gamerTags, [tournament.id]: event.target.value })}
              />
              <Button onClick={() => register(tournament)}>Register</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {tournament.registrations.length}/{tournament.maxPlayers} players registered
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
