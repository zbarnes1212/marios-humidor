import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOVEE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Govee API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://developer-api.govee.com/v1/devices', {
      headers: {
        'Govee-API-Key': apiKey,
      },
    });

    const data = await response.json();
    const devices = data?.data?.devices || [];

    // Get readings for each device
    const readings = await Promise.all(
      devices.map(async (device: { device: string; model: string; deviceName: string }) => {
        const stateRes = await fetch(
          `https://developer-api.govee.com/v1/devices/state?device=${encodeURIComponent(device.device)}&model=${device.model}`,
          { headers: { 'Govee-API-Key': apiKey } }
        );
        const stateData = await stateRes.json();
        const properties = stateData?.data?.properties || [];
        
        const humidity = properties.find((p: Record<string, unknown>) => 'humidity' in p)?.humidity;
        const temperature = properties.find((p: Record<string, unknown>) => 'temperature' in p)?.temperature;

        return {
          id: device.device,
          name: device.deviceName,
          model: device.model,
          humidity: humidity ?? null,
          temperature: temperature ?? null,
        };
      })
    );

    return NextResponse.json({ devices: readings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Govee data', details: String(error) }, { status: 500 });
  }
}
