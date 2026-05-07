import { createTournamentAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: { registrations: true },
    orderBy: { startsAt: "desc" },
    take: 100
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="xl:sticky xl:top-24 xl:self-start">
        <CardHeader>
          <CardTitle>Create tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTournamentAction} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input name="title" required /></div>
            <div className="space-y-2"><Label>Game</Label><Input name="game" required /></div>
            <div className="space-y-2"><Label>Starts at</Label><Input name="startsAt" type="datetime-local" required /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Entry</Label><Input name="entryFee" type="number" defaultValue="0" /></div>
              <div className="space-y-2"><Label>Prize</Label><Input name="prizePool" type="number" defaultValue="0" /></div>
              <div className="space-y-2"><Label>Players</Label><Input name="maxPlayers" type="number" defaultValue="32" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea name="description" /></div>
            <div className="space-y-2"><Label>Rules</Label><Textarea name="rules" /></div>
            <Button className="w-full">Create event</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {tournaments.map((tournament) => (
          <Card key={tournament.id}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tournament.game} · {tournament.startsAt.toLocaleString()} · {tournament.registrations.length}/{tournament.maxPlayers}
                </p>
              </div>
              <p className="font-bold text-neon-cyan">{formatINR(tournament.prizePool)} pool</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
