import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const FEATURED_DAYS = 7;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Firma no válida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const jobId = session.metadata?.job_id;
  const userId = session.metadata?.user_id;
  if (!jobId || !userId) {
    return NextResponse.json({ error: "Metadatos incompletos" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotencia: si Stripe reenvía el evento, no se procesa dos veces
  const { error: orderError } = await admin.from("orders").insert({
    stripe_session_id: session.id,
    user_id: userId,
    job_id: jobId,
    type: "featured",
    amount: session.amount_total,
    currency: session.currency,
  });

  if (orderError) {
    if (orderError.code === "23505") {
      return NextResponse.json({ received: true });
    }
    return NextResponse.json({ error: "Error al guardar el pedido" }, { status: 500 });
  }

  const { data: job } = await admin
    .from("job_posts")
    .select("featured_until")
    .eq("id", jobId)
    .single();

  const now = new Date();
  const base = job?.featured_until && new Date(job.featured_until) > now ? new Date(job.featured_until) : now;
  const featuredUntil = new Date(base.getTime() + FEATURED_DAYS * 24 * 60 * 60 * 1000);

  const { error: updateError } = await admin
    .from("job_posts")
    .update({ featured_until: featuredUntil.toISOString() })
    .eq("id", jobId);

  if (updateError) {
    await admin.from("orders").delete().eq("stripe_session_id", session.id);
    return NextResponse.json({ error: "Error al activar el destacado" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
