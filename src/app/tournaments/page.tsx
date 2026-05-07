import { TournamentList } from "@/components/tournaments/tournament-list";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    where: { status: { in: ["UPCOMING", "LIVE"] } },
    include: { registrations: true },
    orderBy: { startsAt: "asc" }
  });

  return (
    <main className="container py-12">
      <Badge variant="outline">Tournaments</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-white">Events and knockout nights</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Register with a gamer tag and track player capacity before the bracket goes live.
      </p>
      <div className="mt-8">
        <TournamentList
          tournaments={tournaments.map((tournament) => ({
            id: tournament.id,
            title: tournament.title,
            game: tournament.game,
            startsAt: tournament.startsAt.toISOString(),
            entryFee: Number(tournament.entryFee),
            prizePool: Number(tournament.prizePool),
            maxPlayers: tournament.maxPlayers,
            status: tournament.status,
            description: tournament.description,
            registrations: tournament.registrations.map((registration) => ({ id: registration.id }))
          }))}
        />
      </div>
    </main>
  );
}
