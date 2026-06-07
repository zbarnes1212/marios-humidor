import { NextRequest, NextResponse } from 'next/server';

let latestReading: {
  temperature: number;
  humidity: number;
  timestamp: string;
} | null = null;

const SENSOR_SECRET = process.env.SENSOR_SECRET ?? '';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sensor-secret');
  if (SENSOR_SECRET && secret !== SENSOR_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { temperature, humidity } = body;
  if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  latestReading = { temperature, humidity, timestamp: new Date().toISOString() };
  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!latestReading) {
    return NextResponse.json({ error: 'No sensor data yet' }, { status: 503 });
  }
  return NextResponse.json(latestReading);
}
