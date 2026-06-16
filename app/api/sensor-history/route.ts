import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '24H';
  const device = searchParams.get('device') || "Mario's Sensor";

  const ms: Record<string,number> = {
    '24H': 24*60*60*1000,
    '7D':  7*24*60*60*1000,
    '30D': 30*24*60*60*1000,
    '90D': 90*24*60*60*1000,
  };

  const since = new Date(Date.now() - (ms[range]||ms['24H'])).toISOString();

  const { data, error } = await supabase
    .from('sensor_readings')
    .select('humidity, temperature, created_at')
    .eq('device_name', device)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
