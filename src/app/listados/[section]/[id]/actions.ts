"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

const FEATURED_PRICE_GROSZ = 1900;

export async function startListingFeatured(section: string, id: string) {
  if (section !== "sale" && section !== "rent") throw new Error("Sección no válida");
  const table = (section === "sale" ? "sale_listings" : "rental_listings") as "sale_listings";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: item } = await supabase
    .from(table)
    .select("id, title, author_id")
    .eq("id", id)
    .single();

  if (!item || item.author_id !== user.id) throw new Error("No autorizado");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "pln",
          unit_amount: FEATURED_PRICE_GROSZ,
          product_data: {
            name: `Destacar: ${item.title}`,
            description: "Aparece primero en el listado durante 7 días",
          },
        },
      },
    ],
    metadata: { listing_table: table, listing_id: item.id, user_id: user.id },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/listados/${section}/${id}?featured=ok`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/listados/${section}/${id}`,
  });

  redirect(session.url!);
}