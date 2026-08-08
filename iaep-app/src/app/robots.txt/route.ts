import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const robots = [
        'User-agent: *',
        'Allow: /article/',
        'Allow: /publication/',
        'Allow: /api/oai/',
        'Allow: /api/article/',
        'Allow: /api/publication/',
        'Allow: *.pdf',
        'Disallow: /api/',
        'Disallow: /admin/',
        'Disallow: /dashboard/',
        '',
        'Sitemap: https://apasific.org/sitemap.xml'
    ].join('\n');

    return new NextResponse(robots, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, must-revalidate',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
