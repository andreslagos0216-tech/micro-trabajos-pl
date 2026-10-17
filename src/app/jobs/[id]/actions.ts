"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

const FEATURED_PRICE_GROSZ = 1900; // 19,00 zł (Stripe usa groszy)

export async function startFeaturedCheckout(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("job_posts")
    .select("id, title, author_id")
    .eq("id", jobId)
    .single();

  if (!job || job.author_id !== user.id) {
    throw new Error("No autorizado");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "pln",
          unit_amount: FEATURED_PRICE_GROSZ,
          product_data: {
            name: `Destacar: ${job.title}`,
            description: "Aparece primero en el listado durante 7 días",
          },
        },
      },
    ],
    metadata: { job_id: job.id, user_id: user.id },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${job.id}?featured=ok`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${job.id}`,
  });

  redirect(session.url!);
}

