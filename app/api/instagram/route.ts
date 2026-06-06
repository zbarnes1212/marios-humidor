import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export async function GET() {
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${ACCESS_TOKEN}&limit=12`
    );
    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ ok: false, error: data.error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, posts: data.data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
