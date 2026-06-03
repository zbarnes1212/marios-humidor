// /app/api/sensorpush/route.ts
// Server-side proxy for SensorPush API — keeps credentials out of the browser

import { NextRequest, NextResponse } from "next/server";

const SP_BASE = "https://api.sensorpush.com/api/v1";

// Step 1: Get OAuth access token using email + password
async function getAccessToken(): Promise<string> {
  const email = process.env.SENSORPUSH_EMAIL;
  const password = process.env.SENSORPUSH_PASSWORD;

  if (!email || !password) {
    throw new Error("SENSORPUSH_EMAIL and SENSORPUSH_PASSWORD must be set in .env.local");
  }

  // First: get authorization code
  const authRes = await fetch(`${SP_BASE}/oauth/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!authRes.ok) {
    throw new Error(`SensorPush auth failed: ${authRes.status}`);
  }

  const { authorization } = await authRes.json();

  // Second: exchange code for access token
  const tokenRes = await fetch(`${SP_BASE}/oauth/accesstoken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ authorization }),
  });

  if (!tokenRes.ok) {
    throw new Error(`SensorPush token exchange failed: ${tokenRes.status}`);
  }

  const { accesstoken } = await tokenRes.json();
  return accesstoken;
}

// Step 2: Fetch sensors list
async function getSensors(token: string) {
  const res = await fetch(`${SP_BASE}/devices/sensors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": token,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error(`getSensors failed: ${res.status}`);
  return res.json();
}

// Step 3: Fetch latest samples for all sensors
async function getSamples(token: string, sensorIds: string[]) {
  const res = await fetch(`${SP_BASE}/samples`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": token,
    },
    body: JSON.stringify({
      sensors: sensorIds,
      limit: 1, // just the latest reading per sensor
    }),
  });

  if (!res.ok) throw new Error(`getSamples failed: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const token = await getAccessToken();
    const sensorsData = await getSensors(token);

    const sensorIds = Object.keys(sensorsData);

    if (sensorIds.length === 0) {
      return NextResponse.json({ sensors: [], samples: {} });
    }

    const samplesData = await getSamples(token, sensorIds);

    // Shape the response for the app
    const sensors = sensorIds.map((id) => {
      const sensor = sensorsData[id];
      const sensorSamples = samplesData.sensors?.[id]?.samples ?? [];
      const latest = sensorSamples[0] ?? null;

      return {
        id,
        name: sensor.name,
        deviceId: sensor.deviceId,
        battery: sensor.battery?.percentage ?? null,
        rssi: sensor.rssi ?? null,
        // Latest reading
        temperature: latest ? parseFloat((latest.temperature * 9/5 + 32).toFixed(1)) : null, // C→F
        humidity: latest ? parseFloat(latest.humidity.toFixed(1)) : null,
        observedAt: latest?.observed ?? null,
      };
    });

    return NextResponse.json({ sensors, ok: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[SensorPush API]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
