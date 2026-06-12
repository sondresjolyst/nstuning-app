import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const upstream = `${process.env.NEXT_PUBLIC_API_URL}/dyno-runs/${id}/report`;

    const res = await fetch(upstream, { cache: 'no-store' });

    if (!res.ok) {
        return new NextResponse(null, { status: res.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') ?? 'application/pdf');
    const disposition = res.headers.get('Content-Disposition');
    if (disposition) headers.set('Content-Disposition', disposition);

    return new NextResponse(res.body, { status: 200, headers });
}
