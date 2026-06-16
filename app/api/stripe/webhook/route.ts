import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.CheckoutSession;
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId;
      if (!userId) return NextResponse.json({ received: true });
      const isCompanion = priceId === process.env.NEXT_PUBLIC_STRIPE_COMPANION_PRICE_ID;
      const tier = isCompanion ? "companion" : "pro";
      await supabase.from("profiles").upsert({
        id: userId,
        membership_tier: tier,
        stripe_customer_id: session.customer as string,
        updated_at: new Date().toISOString(),
      });
      console.log(`[webhook] ${userId} upgraded to ${tier}`);
    }
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const { data } = await supabase.from("profiles").select("id").eq("stripe_customer_id", sub.customer as string).single();
      if (data) {
        await supabase.from("profiles").update({ membership_tier: "free" }).eq("id", data.id);
      }
    }
  } catch (err) {
    console.error("[webhook] error:", err);
  }
  return NextResponse.json({ received: true });
}
