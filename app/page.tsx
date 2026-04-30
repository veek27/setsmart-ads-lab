export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans">
      <main className="max-w-2xl px-6 py-20">
        <div className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
          SetSmart · Ads Lab
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Le batch du jour arrive bientôt.
        </h1>
        <p className="text-lg text-zinc-400 mb-10">
          10 nouveaux concepts d&apos;ads, FR + EN, générés chaque matin à 9h
          (heure Paris). Tu donnes ton feedback, le lendemain c&apos;est
          meilleur.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-zinc-800 p-5">
            <div className="text-zinc-500 mb-1">Statut</div>
            <div className="font-medium">Setup en cours</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 p-5">
            <div className="text-zinc-500 mb-1">Prochain batch</div>
            <div className="font-medium">À configurer</div>
          </div>
        </div>
      </main>
    </div>
  );
}
