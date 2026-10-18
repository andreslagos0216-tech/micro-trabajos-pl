import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { geoText } from "@/lib/i18n-geo";
import { ui } from "@/lib/ui";
import { MapView, type MapPoint } from "@/components/map-view";

export default function MapPage() {
  return (
    <Suspense fallback={null}>
      <MapContent />
    </Suspense>
  );
}

async function MapContent() {
  await connection();
  const lang = await getLang();
  const g = geoText[lang];
  const supabase = await createClient();

  const { data } = await supabase
    .from("job_posts")
    .select("id, title, pay_pln, pay_type, lat, lng, cities(name)")
    .eq("status", "active")
    .not("lat", "is", null)
    .order("bumped_at", { ascending: false })
    .limit(500);

  const points: MapPoint[] = (data ?? [])
    .filter((j) => j.lat != null && j.lng != null)
    .map((j) => ({
      id: j.id,
      title: j.title,
      lat: j.lat as number,
      lng: j.lng as number,
      city: j.cities?.name ?? "",
      pay: `${j.pay_pln} zł / ${j.pay_type === "hour" ? "h" : "→"}`,
    }));

  return (
    <main className={`${ui.container} max-w-5xl`}>
      <h1 className={ui.title}>{g.mapTitle}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{g.mapSubtitle}</p>
      {points.length === 0 ? (
        <p className={ui.emptyBox}>{g.mapEmpty}</p>
      ) : (
        <MapView points={points} openLabel={g.openListing} />
      )}
    </main>
  );
}
