import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ESP32 posts sensor data here
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { temperature, humidity, device_name } = body;

    if (typeof temperature !== "number" || typeof humidity !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { error } = await supabase
      .from("sensor_readings")
      .insert({
        device_name: device_name ?? "Mario's Sensor",
        temperature,
        humidity,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// App reads latest sensor data here
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sensor_readings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "No sensor data yet" }, { status: 503 });
    }

    return NextResponse.json({
      temperature: data.temperature,
      humidity: data.humidity,
      device_name: data.device_name,
      timestamp: data.created_at,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
