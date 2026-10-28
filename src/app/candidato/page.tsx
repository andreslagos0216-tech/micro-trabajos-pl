import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { saveCandidate } from "./actions";

type SearchParams = Promise<{ ok?: string; error?: string }>;

const T = {
  pl: {
    title: "Profil kandydata",
    subtitle: "Uzupełnij profil, żeby móc składać aplikacje na oferty pracy.",
    headline: "Stanowisko lub zawód",
    headlinePh: "Np. kierowca, kucharz, magazynier",
    experience: "Doświadczenie",
    experiencePh: "Opisz krótko poprzednie prace i umiejętności",
    availability: "Dostępność",
    availabilityPh: "Np. pełny etat, weekendy, od zaraz",
    save: "Zapisz profil",
    saved: "Profil zapisany.",
    errData: "Podaj stanowisko (minimum 3 znaki).",
    errSave: "Nie udało się zapisać. Spróbuj ponownie.",
    confirm: "Najpierw potwierdź adres e-mail, aby zapisać profil.",
  },
  es: {
    title: "Perfil de candidato",
    subtitle: "Completa tu perfil para poder postular a ofertas de empleo.",
    headline: "Puesto o profesión",
    headlinePh: "Ej.: conductor, cocinero, almacenero",
    experience: "Experiencia",
    experiencePh: "Describe brevemente tus trabajos anteriores y habilidades",
    availability: "Disponibilidad",
    availabilityPh: "Ej.: jornada completa, fines de semana, inmediata",
    save: "Guardar perfil",
    saved: "Perfil guardado.",
    errData: "Indica tu puesto (mínimo 3 caracteres).",
    errSave: "No se pudo guardar. Inténtalo de nuevo.",
    confirm: "Primero confirma tu correo para guardar el perfil.",
  },
};

export default function CandidatoPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className={`${ui.container} max-w-xl`}>
      <Suspense fallback={null}>
        <CandidatoContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CandidatoContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const lang = await getLang();
  const t = lang === "pl" ? T.pl : T.es;
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("headline, experience, availability")
    .eq("id", user.id)
    .single();

  return (
    <>
      <h1 className={ui.title}>{t.title}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.subtitle}</p>

      {!user.email_confirmed_at && <p className={`mb-4 ${ui.errorBox}`}>{t.confirm}</p>}
      {sp.ok === "1" && <p className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{t.saved}</p>}
      {sp.error === "datos" && <p className={`mb-4 ${ui.errorBox}`}>{t.errData}</p>}
      {sp.error === "guardar" && <p className={`mb-4 ${ui.errorBox}`}>{t.errSave}</p>}

      <form action={saveCandidate} className={`${ui.card} space-y-5`}>
        <div>
          <label htmlFor="headline" className={ui.label}>{t.headline}</label>
          <input id="headline" name="headline" required minLength={3} maxLength={120} defaultValue={profile?.headline ?? ""} placeholder={t.headlinePh} className={ui.input} />
        </div>
        <div>
          <label htmlFor="experience" className={ui.label}>{t.experience}</label>
          <textarea id="experience" name="experience" rows={5} maxLength={2000} defaultValue={profile?.experience ?? ""} placeholder={t.experiencePh} className={ui.input} />
        </div>
        <div>
          <label htmlFor="availability" className={ui.label}>{t.availability}</label>
          <input id="availability" name="availability" maxLength={120} defaultValue={profile?.availability ?? ""} placeholder={t.availabilityPh} className={ui.input} />
        </div>
        <button type="submit" className={`${ui.button} w-full`}>{t.save}</button>
      </form>

      <p className="mt-6 text-sm">
        <Link href="/perfil" className={ui.link}>←</Link>
      </p>
    </>
  );
}