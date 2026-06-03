// /app/api/govee/route.ts
// Fetches live temperature & humidity from Govee H5179 sensors via Govee OpenAPI

import { NextResponse } from "next/server";

const GOVEE_BASE = "https://openapi.api.govee.com/router/api/v1";

export async function GET() {
  const apiKey = process.env.GOVEE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "GOVEE_API_KEY not set in .env.local" }, { status: 500 });
  }

  try {
    // Step 1: Get all devices on the account
    const devicesRes = await fetch(`${GOVEE_BASE}/user/devices`, {
      headers: {
        "Content-Type": "application/json",
        "Govee-API-Key": apiKey,
      },
    });

    if (!devicesRes.ok) {
      throw new Error(`Govee devices fetch failed: ${devicesRes.status}`);
    }

    const devicesData = await devicesRes.json();
    const devices: { sku: string; device: string; deviceName: string }[] =
      devicesData.data ?? [];

    // Filter to H5179 sensors only
    const sensors = devices.filter((d) => d.sku === "H5179");

    if (sensors.length === 0) {
      return NextResponse.json({ ok: true, sensors: [], message: "No H5179 sensors found on this account" });
    }

    // Step 2: Fetch current state for each sensor
    const results = await Promise.all(
      sensors.map(async (sensor) => {
        const stateRes = await fetch(`${GOVEE_BASE}/device/state`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Govee-API-Key": apiKey,
          },
          body: JSON.stringify({
            requestId: "marios-humidor",
            payload: {
              sku: sensor.sku,
              device: sensor.device,
            },
          }),
        });

        if (!stateRes.ok) {
          return { name: sensor.deviceName, error: `State fetch failed: ${stateRes.status}` };
        }

        const stateData = await stateRes.json();
        const capabilities: { instance: string; state: { value: number } }[] =
          stateData.payload?.capabilities ?? [];

        // Extract temperature (returned in Celsius × 100) and humidity (× 100)
        const tempCap = capabilities.find((c) => c.instance === "sensorTemperature");
        const humCap = capabilities.find((c) => c.instance === "sensorHumidity");

        const tempC = tempCap ? tempCap.state.value / 100 : null;
        const humidity = humCap ? humCap.state.value / 100 : null;

        // Convert to Fahrenheit
        const tempF = tempC !== null ? parseFloat((tempC * 9 / 5 + 32).toFixed(1)) : null;

        return {
          name: sensor.deviceName,
          deviceId: sensor.device,
          temperature: tempF,
          humidity: humidity !== null ? parseFloat(humidity.toFixed(1)) : null,
          observedAt: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ ok: true, sensors: results });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Govee API]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
