import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createJob } from "./actions";

export default function NewJobPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Publicar oferta</h1>
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
    <form action={createJob} className="space-y-4">
      <input name="title" placeholder="Título (5 a 120 caracteres)" required minLength={5} maxLength={120} className="w-full rounded border px-3 py-2" />

      <textarea name="description" placeholder="Descripción" required maxLength={5000} rows={6} className="w-full rounded border px-3 py-2" />

      <select name="city_id" required defaultValue="" className="w-full rounded border px-3 py-2">
        <option value="" disabled>Selecciona ciudad</option>
        {cities?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select name="category_id" required defaultValue="" className="w-full rounded border px-3 py-2">
        <option value="" disabled>Selecciona categoría</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select name="pay_type" required defaultValue="hour" className="w-full rounded border px-3 py-2">
        <option value="hour">Por hora</option>
        <option value="project">Por proyecto</option>
      </select>

      <input name="pay_pln" type="number" step="0.01" min="1" placeholder="Tarifa en PLN" required className="w-full rounded border px-3 py-2" />

      <button className="w-full rounded bg-black py-2 text-white">Publicar</button>
    </form>
  );
}
