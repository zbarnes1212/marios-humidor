// lib/sync.ts
// Data sync layer — reads from Supabase on mount, writes to both localStorage and Supabase
// Falls back gracefully to localStorage if Supabase is unavailable

import { getSupabaseClient } from "./supabase";

// ── HUMIDORS ──────────────────────────────────────────────────────────────
export async function fetchHumidors(token: string, userId: string) {
  try {
    const sb = getSupabaseClient(token);
    const { data, error } = await sb
      .from("user_humidors")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data.map((h: any) => ({
      id: h.id,
      name: h.name,
      wood: h.wood,
      capacity: h.capacity,
      status: h.status,
    }));
  } catch (e) {
    console.error("[sync] fetchHumidors:", e);
    return null;
  }
}

export async function upsertHumidor(token: string, userId: string, humidor: any) {
  try {
    const sb = getSupabaseClient(token);
    const { error } = await sb.from("user_humidors").upsert({
      id: humidor.id,
      user_id: userId,
      name: humidor.name,
      wood: humidor.wood,
      capacity: humidor.capacity,
      status: humidor.status || "no_data",
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.error("[sync] upsertHumidor:", e);
  }
}

export async function deleteHumidor(token: string, userId: string, id: number) {
  try {
    const sb = getSupabaseClient(token);
    await sb.from("user_humidors").delete().eq("id", id).eq("user_id", userId);
  } catch (e) {
    console.error("[sync] deleteHumidor:", e);
  }
}

// ── CIGARS ────────────────────────────────────────────────────────────────
export async function fetchCigars(token: string, userId: string) {
  try {
    const sb = getSupabaseClient(token);
    const { data, error } = await sb
      .from("user_cigars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data.map((c: any) => ({
      id: c.id,
      brand: c.brand,
      line: c.line,
      vitola: c.vitola,
      origin: c.origin,
      wrapper: c.wrapper,
      rating: c.rating,
      count: c.count,
      purchaseDate: c.purchase_date,
      bandColor: c.band_color,
      humidorId: c.humidor_id,
      imageUrl: c.image_url,
    }));
  } catch (e) {
    console.error("[sync] fetchCigars:", e);
    return null;
  }
}

export async function upsertCigar(token: string, userId: string, cigar: any) {
  try {
    const sb = getSupabaseClient(token);
    const { error } = await sb.from("user_cigars").upsert({
      id: cigar.id,
      user_id: userId,
      humidor_id: cigar.humidorId || null,
      brand: cigar.brand || "",
      line: cigar.line || "",
      vitola: cigar.vitola || "",
      origin: cigar.origin || "",
      wrapper: cigar.wrapper || "",
      rating: cigar.rating || 0,
      count: cigar.count || 0,
      purchase_date: cigar.purchaseDate || "",
      band_color: cigar.bandColor || "gold",
      image_url: cigar.imageUrl || null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.error("[sync] upsertCigar:", e);
  }
}

export async function deleteCigar(token: string, userId: string, id: number) {
  try {
    const sb = getSupabaseClient(token);
    await sb.from("user_cigars").delete().eq("id", id).eq("user_id", userId);
  } catch (e) {
    console.error("[sync] deleteCigar:", e);
  }
}

// ── RECORDS ───────────────────────────────────────────────────────────────
export async function fetchRecords(token: string, userId: string) {
  try {
    const sb = getSupabaseClient(token);
    const { data, error } = await sb
      .from("user_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((r: any) => ({
      id: r.id,
      brand: r.brand,
      line: r.line,
      vitola: r.vitola,
      wrapper: r.wrapper,
      origin: r.origin,
      status: r.status,
      note: r.note,
      rating: r.rating,
      photo: r.photo_url || null,
      date: r.date,
    }));
  } catch (e) {
    console.error("[sync] fetchRecords:", e);
    return null;
  }
}

export async function upsertRecord(token: string, userId: string, record: any) {
  try {
    const sb = getSupabaseClient(token);
    const { error } = await sb.from("user_records").upsert({
      id: record.id,
      user_id: userId,
      brand: record.brand || "",
      line: record.line || "",
      vitola: record.vitola || "",
      wrapper: record.wrapper || "",
      origin: record.origin || "",
      status: record.status || "smoked",
      note: record.note || "",
      rating: record.rating || 0,
      photo_url: record.photo || null,
      date: record.date || "",
    });
    if (error) throw error;
  } catch (e) {
    console.error("[sync] upsertRecord:", e);
  }
}

export async function deleteRecord(token: string, userId: string, id: number) {
  try {
    const sb = getSupabaseClient(token);
    await sb.from("user_records").delete().eq("id", id).eq("user_id", userId);
  } catch (e) {
    console.error("[sync] deleteRecord:", e);
  }
}

// ── NOTES ─────────────────────────────────────────────────────────────────
export async function fetchNotes(token: string, userId: string) {
  try {
    const sb = getSupabaseClient(token);
    const { data, error } = await sb
      .from("user_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((n: any) => ({
      id: n.id,
      cigarId: n.cigar_id,
      recordId: n.record_id,
      brand: n.brand,
      line: n.line,
      vitola: n.vitola,
      rating: n.rating,
      notes: n.notes,
      pairing: n.pairing,
      photo: n.photo_url || null,
      date: n.date,
    }));
  } catch (e) {
    console.error("[sync] fetchNotes:", e);
    return null;
  }
}

export async function upsertNote(token: string, userId: string, note: any) {
  try {
    const sb = getSupabaseClient(token);
    const { error } = await sb.from("user_notes").upsert({
      id: note.id,
      user_id: userId,
      cigar_id: note.cigarId || null,
      record_id: note.recordId || null,
      brand: note.brand || "",
      line: note.line || "",
      vitola: note.vitola || "",
      rating: note.rating || 0,
      notes: note.notes || "",
      pairing: note.pairing || "",
      photo_url: note.photo || null,
      date: note.date || "",
    });
    if (error) throw error;
  } catch (e) {
    console.error("[sync] upsertNote:", e);
  }
}

// ── BULK SYNC (first load — pull everything from Supabase) ─────────────
export async function pullAllData(token: string, userId: string) {
  const [humidors, cigars, records, notes] = await Promise.all([
    fetchHumidors(token, userId),
    fetchCigars(token, userId),
    fetchRecords(token, userId),
    fetchNotes(token, userId),
  ]);
  return { humidors, cigars, records, notes };
}

// ── BULK PUSH (migrate existing localStorage data to Supabase) ──────────
export async function pushAllLocalData(token: string, userId: string) {
  try {
    const humidors = JSON.parse(localStorage.getItem("mh_humidors") || "[]");
    const cigars = JSON.parse(localStorage.getItem("mh_cigars") || "[]");
    const records = JSON.parse(localStorage.getItem("mh_records") || "[]");
    const notes = JSON.parse(localStorage.getItem("mh_notes") || "[]");

    await Promise.all([
      ...humidors.map((h: any) => upsertHumidor(token, userId, h)),
      ...cigars.map((c: any) => upsertCigar(token, userId, c)),
      ...records.map((r: any) => upsertRecord(token, userId, r)),
      ...notes.map((n: any) => upsertNote(token, userId, n)),
    ]);
    console.log("[sync] pushed all local data to Supabase");
  } catch (e) {
    console.error("[sync] pushAllLocalData:", e);
  }
}
