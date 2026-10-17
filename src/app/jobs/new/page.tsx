import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ui } from "@/lib/ui";
import { createJob } from "./actions";

export default function NewJobPage() {
  return (
    <main className={ui.container}>
      <h1 className={ui.title}>Publicar oferta</h1>
      <p className={`mb-6 ${ui.subtitle}`}>Completa los datos. La oferta se publica al enviar el formulario.</p>
      <Suspense fallback={<p className={ui.muted}>Cargando formulario...</p>}>
        <JobForm />
      </Suspense>
    </main>
  );
}

async function JobForm() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: cities }, { data: categories }] = await Promise.all([
    supabase.from("cities").select("id, name").order("name"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  return (
    <form action={createJob} className={`${ui.card} space-y-5`}>
      <div>
        <label htmlFor="title" className={ui.label}>Título</label>
        <input id="title" name="title" required minLength={5} maxLength={120} placeholder="Ej.: Limpieza de piso de 60 m²" className={ui.input} />
      </div>

      <div>
        <label htmlFor="description" className={ui.label}>Descripción</label>
        <textarea id="description" name="description" required maxLength={5000} rows={5} placeholder="Describe el trabajo, horario y requisitos" className={ui.input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city_id" className={ui.label}>Ciudad</label>
          <select id="city_id" name="city_id" required defaultValue="" className={ui.input}>
            <option value="" disabled>Selecciona una ciudad</option>
            {cities?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category_id" className={ui.label}>Categoría</label>
          <select id="category_id" name="category_id" required defaultValue="" className={ui.input}>
            <option value="" disabled>Selecciona una categoría</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pay_type" className={ui.label}>Tipo de pago</label>
          <select id="pay_type" name="pay_type" required defaultValue="hour" className={ui.input}>
            <option value="hour">Por hora</option>
            <option value="project">Por proyecto</option>
          </select>
        </div>
        <div>
          <label htmlFor="pay_pln" className={ui.label}>Tarifa</label>
          <div className="relative">
            <input id="pay_pln" name="pay_pln" type="number" step="0.01" min="1" required placeholder="0.00" className={`${ui.input} pr-12`} />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">zł</span>
          </div>
          <p className={`mt-1.5 text-xs ${ui.muted}`}>Importe en złotych (PLN), por hora o por proyecto según el tipo elegido.</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <a href="/" className={ui.buttonSecondary}>Cancelar</a>
        <button type="submit" className={ui.button}>Publicar oferta</button>
      </div>
    </form>
  );
}
