import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import ShareGallery, { type ShareFile } from "./ShareGallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { token: string };

export default async function SharePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token } = await params;
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("shares")
    .select("token, batch_id, files, created_at, batches(date)")
    .eq("token", token)
    .maybeSingle();

  if (!data) notFound();

  const files = data.files as ShareFile[];
  const batches = data.batches as unknown as { date: string } | null;
  const batchDate = batches?.date || "—";
  const friendly = new Date(batchDate + "T12:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-setsmart.png"
              alt="SetSmart"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold mb-1">
                SetSmart Ads · Pack média
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight capitalize">
                {friendly}
              </h1>
              <div className="text-xs text-zinc-500 mt-1">
                {files.length} créatives · format 9:16 · 1080×1920
              </div>
            </div>
          </div>
        </header>

        <ShareGallery token={token} files={files} batchDate={batchDate} />
      </div>
    </main>
  );
}
