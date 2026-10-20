import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getLang, type Lang } from "@/lib/i18n";
import { ui } from "@/lib/ui";
import { LocalityPicker } from "@/components/locality-picker";
import { sendStaffRequest } from "./actions";

type SearchParams = Promise<{ ok?: string; error?: string }>;

const T: Record<Lang, Record<string, string>> = {
  pl: {
    title: "Potrzebujesz pomocy?",
    subtitle: "Opisz, czego potrzebujesz, a znajdziemy osoby z Twojej okolicy. Usługa jest bezpłatna dla zgłaszającego.",
    name: "Imię",
    whatsapp: "WhatsApp",
    whatsappHint: "Na ten numer odezwiemy się do Ciebie.",
    workType: "Rodzaj pracy",
    workTypePh: "Np. sprzątanie mieszkania, odśnieżanie podjazdu",
    description: "Szczegóły (opcjonalnie)",
    when: "Kiedy?",
    whenPh: "Np. sobota rano, co tydzień",
    people: "Ile osób?",
    pay: "Forma płatności",
    payHour: "Za godzinę",
    payDay: "Za dzień",
    payProject: "Za zlecenie",
    payAgreed: "Do uzgodnienia",
    amount: "Kwota (zł)",
    language: "Język kontaktu",
    send: "Wyślij zgłoszenie",
    done: "Dziękujemy. Odezwiemy się na WhatsApp.",
    errData: "Sprawdź imię, WhatsApp i rodzaj pracy.",
    errSave: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
  },
  es: {
    title: "¿Necesitas personal?",
    subtitle: "Describe lo que necesitas y buscamos personas de tu zona. El servicio es gratuito para quien lo solicita.",
    name: "Nombre",
    whatsapp: "WhatsApp",
    whatsappHint: "Te contactaremos por este número.",
    workType: "Tipo de trabajo",
    workTypePh: "Ej.: limpieza de casa, quitar nieve del garaje",
    description: "Detalles (opcional)",
    when: "¿Cuándo?",
    whenPh: "Ej.: sábado por la mañana, todas las semanas",
    people: "¿Cuántas personas?",
    pay: "Forma de pago",
    payHour: "Por hora",
    payDay: "Por día",
    payProject: "Por trabajo",
    payAgreed: "A convenir",
    amount: "Monto (zł)",
    language: "Idioma de contacto",
    send: "Enviar solicitud",
    done: "Gracias. Te escribiremos por WhatsApp.",
    errData: "Revisa el nombre, el WhatsApp y el tipo de trabajo.",
    errSave: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
  },
  en: {
    title: "Need staff?",
    subtitle: "Describe what you need and we'll find people in your area. The service is free for the person requesting it.",
    name: "Name",
    whatsapp: "WhatsApp",
    whatsappHint: "We'll contact you on this number.",
    workType: "Type of work",
    workTypePh: "E.g. house cleaning, clearing a driveway of snow",
    description: "Details (optional)",
    when: "When?",
    whenPh: "E.g. Saturday morning, every week",
    people: "How many people?",
    pay: "Payment type",
    payHour: "Per hour",
    payDay: "Per day",
    payProject: "Per job",
    payAgreed: "Negotiable",
    amount: "Amount (zł)",
    language: "Contact language",
    send: "Send request",
    done: "Thank you. We'll message you on WhatsApp.",
    errData: "Please check your name, WhatsApp and type of work.",
    errSave: "The request could not be sent. Please try again.",
  },
};

export default function StaffRequestPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className={`${ui.container} max-w-xl`}>
      <Suspense fallback={null}>
        <StaffContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function StaffContent({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const lang = await getLang();
  const t = T[lang];
  const { ok, error } = await searchParams;

  if (ok === "1") {
    return (
      <>
        <h1 className={ui.title}>{t.title}</h1>
        <p className="mt-6 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">{t.done}</p>
        <Link href="/" className={`${ui.link} mt-6 inline-block`}>←</Link>
      </>
    );
  }

  return (
    <>
      <h1 className={ui.title}>{t.title}</h1>
      <p className={`mb-6 ${ui.subtitle}`}>{t.subtitle}</p>

      {error === "datos" && <p className={`mb-4 ${ui.errorBox}`}>{t.errData}</p>}
      {error === "guardar" && <p className={`mb-4 ${ui.errorBox}`}>{t.errSave}</p>}

      <form action={sendStaffRequest} className={`${ui.card} space-y-5`}>
        <div>
          <label htmlFor="requester_name" className={ui.label}>{t.name}</label>
          <input id="requester_name" name="requester_name" required minLength={2} maxLength={80} className={ui.input} />
        </div>

        <div>
          <label htmlFor="whatsapp" className={ui.label}>{t.whatsapp}</label>
          <input id="whatsapp" name="whatsapp" type="tel" required minLength={7} maxLength={20} className={ui.input} />
          <p className={`mt-1 text-xs ${ui.muted}`}>{t.whatsappHint}</p>
        </div>

        <div>
          <label htmlFor="work_type" className={ui.label}>{t.workType}</label>
          <input id="work_type" name="work_type" required minLength={3} maxLength={120} placeholder={t.workTypePh} className={ui.input} />
        </div>

        <div>
          <label htmlFor="description" className={ui.label}>{t.description}</label>
          <textarea id="description" name="description" rows={3} maxLength={1000} className={ui.input} />
        </div>

        <LocalityPicker name="locality_id" label="📍" placeholder="Ej.: Kamienna Góra" noResults="—" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="when_needed" className={ui.label}>{t.when}</label>
            <input id="when_needed" name="when_needed" maxLength={120} placeholder={t.whenPh} className={ui.input} />
          </div>
          <div>
            <label htmlFor="people_count" className={ui.label}>{t.people}</label>
            <input id="people_count" name="people_count" type="number" min={1} max={50} defaultValue={1} required className={ui.input} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pay_type" className={ui.label}>{t.pay}</label>
            <select id="pay_type" name="pay_type" defaultValue="hour" className={ui.input}>
              <option value="hour">{t.payHour}</option>
              <option value="day">{t.payDay}</option>
              <option value="project">{t.payProject}</option>
              <option value="agreed">{t.payAgreed}</option>
            </select>
          </div>
          <div>
            <label htmlFor="pay_pln" className={ui.label}>{t.amount}</label>
            <input id="pay_pln" name="pay_pln" type="number" step="0.01" min="0" className={ui.input} />
          </div>
        </div>

        <div>
          <label htmlFor="language" className={ui.label}>{t.language}</label>
          <select id="language" name="language" defaultValue={lang} className={ui.input}>
            <option value="es">Español</option>
            <option value="pl">Polski</option>
            <option value="en">English</option>
          </select>
        </div>

        <button type="submit" className={`${ui.button} w-full`}>{t.send}</button>
      </form>
    </>
  );
}