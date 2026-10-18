import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log("URL:", url ? "OK" : "FALTA");
console.log("Clave:", key ? "OK" : "FALTA");
if (!url || !key) process.exit(1);

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { count, error } = await supabase
  .from("localities")
  .select("*", { count: "exact", head: true });
if (error) throw error;
console.log("Localidades en la base:", count);

const { data } = await supabase
  .from("localities")
  .select("name, voivodeship")
  .like("name_norm", "kamienna%")
  .limit(5);
console.log("Coincidencias para 'kamienna':", data);