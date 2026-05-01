"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  currentDate: string;
  availableDates: string[];
};

function shiftDate(date: string, deltaDays: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

function todayParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function DateNav({ currentDate, availableDates }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const today = todayParis();

  function goTo(date: string) {
    const params = new URLSearchParams(search.toString());
    if (date === today) {
      params.delete("date");
    } else {
      params.set("date", date);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  const prev = shiftDate(currentDate, -1);
  const next = shiftDate(currentDate, 1);
  const canGoNext = next <= today;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => goTo(prev)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
        title="Jour précédent"
      >
        ←
      </button>
      <input
        type="date"
        value={currentDate}
        max={today}
        onChange={(e) => goTo(e.target.value)}
        className="rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-200 font-mono hover:border-zinc-600 focus:border-amber-400/50 focus:outline-none"
      />
      <button
        onClick={() => goTo(next)}
        disabled={!canGoNext}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30 disabled:hover:border-zinc-800 disabled:cursor-not-allowed"
        title="Jour suivant"
      >
        →
      </button>
      {currentDate !== today && (
        <button
          onClick={() => goTo(today)}
          className="ml-1 px-3 py-2 rounded-lg border border-amber-400/40 hover:bg-amber-400/10 text-xs font-bold text-amber-300 transition-colors"
        >
          Aujourd&apos;hui
        </button>
      )}
      {availableDates.length > 0 && (
        <div className="ml-2 hidden md:flex items-center gap-1">
          {availableDates.slice(0, 5).map((d) => (
            <button
              key={d}
              onClick={() => goTo(d)}
              className={`text-[10px] px-2 py-1 rounded-md font-mono font-bold transition-colors ${
                d === currentDate
                  ? "bg-amber-400 text-black"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              {d.slice(5).replace("-", "/")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
