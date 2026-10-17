import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createJob } from "./actions";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10";

const labelClass = "mb-1 block text-sm font-medium text-gray-800";

export default function NewJobPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Publicar oferta</h1>
      <p className="mb-6 text-sm text-gray-600">
        Completa los datos. La oferta aparecerá en el listado al publicarla.
      </p>
      <Suspense fallback={<p className="text-gray-600">Cargando formulario...</p>}>
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
    <form action={createJob} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="title" className={labelClass}>Título</label>
        <input id="title" name="title" required minLength={5} maxLength={120} placeholder="Ej.: Limpieza de piso de 60 m²" className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Descripción</label>
        <textarea id="description" name="description" required maxLength={5000} rows={5} placeholder="Describe el trabajo, horario y requisitos" className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city_id" className={labelClass}>Ciudad</label>
          <select id="city_id" name="city_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>Selecciona una ciudad</option>
            {cities?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category_id" className={labelClass}>Categoría</label>
          <select id="category_id" name="category_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>Selecciona una categoría</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pay_type" className={labelClass}>Tipo de pago</label>
          <select id="pay_type" name="pay_type" required defaultValue="hour" className={inputClass}>
            <option value="hour">Por hora</option>
            <option value="project">Por proyecto</option>
          </select>
        </div>

        <div>
          <label htmlFor="pay_pln" className={labelClass}>Tarifa (zł / PLN)</label>
          <div className="relative">
            <input id="pay_pln" name="pay_pln" type="number" step="0.01" min="1" required placeholder="0.00" className={`${inputClass} pr-12`} />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-gray-500">zł</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Cantidad en złotych polacos, por hora o por proyecto según el tipo elegido.</p>
        </div>
      </div>

      <button type="submit" className="w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
        Publicar oferta
      </button>
    </form>
  );
}
