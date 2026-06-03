import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOVEE_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "No API key" });
  try {
    const res = await fetch("https://openapi.api.govee.com/router/api/v1/user/devices", { headers: { "Govee-API-Key": apiKey } });
    const data = await res.json();
    if (!data.data?.length) return NextResponse.json({ ok: false, error: "No devices found" });
    const sensors = await Promise.all(data.data.map(async (device: any) => {
      try {
        const stateRes = await fetch("https://openapi.api.govee.com/router/api/v1/device/state", {
          method: "POST",
          headers: { "Govee-API-Key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: "state", payload: { sku: device.sku, device: device.device } }),
        });
        const stateData = await stateRes.json();
        const caps = stateData.payload?.capabilities ?? [];
        const temp = caps.find((c: any) => c.instance === "sensorTemperature")?.state?.value ?? null;
        const hum = caps.find((c: any) => c.instance === "sensorHumidity")?.state?.value ?? null;
        return { name: device.deviceName, temperature: temp, humidity: hum, observedAt: new Date().toISOString() };
      } catch {
        return { name: device.deviceName, temperature: null, humidity: null, observedAt: null };
      }
    }));
    return NextResponse.json({ ok: true, sensors });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
