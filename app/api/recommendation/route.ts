import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Get total count of active cigars
  const { count, error: countError } = await supabase
    .from('cigar_catalog')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (countError || !count) {
    return NextResponse.json({ error: countError?.message ?? 'No cigars found' }, { status: 500 });
  }

  // Pick a random offset
  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from('cigar_catalog')
    .select('*')
    .eq('is_active', true)
    .range(randomOffset, randomOffset)
    .limit(1);

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: error?.message ?? 'No cigar returned' }, { status: 500 });
  }

  const cigar = data[0];

  return NextResponse.json({
    cigar: `${cigar.brand} ${cigar.line}`.trim(),
    vitola: cigar.cigar_name ?? cigar.vitola ?? '',
    why: cigar.description
      ? cigar.description
      : `A ${cigar.brand} worth exploring — ${cigar.line}${cigar.cigar_name ? `, ${cigar.cigar_name}` : ''}.`,
    image: cigar.image_filename ? `/cigars/${cigar.image_filename}` : null,
  });
}
