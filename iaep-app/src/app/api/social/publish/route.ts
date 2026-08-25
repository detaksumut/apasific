import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platform,
      title,
      journal,
      doi,
      authors,
      articleUrl,
      coverUrl,
      caption: customCaption
    } = body;

    if (!platform || !title) {
      return NextResponse.json({ error: 'Missing required parameters (platform, title)' }, { status: 400 });
    }

    const defaultCaption = customCaption || `📚 PUBLIKASI ILMIAH RESMI APASIFIC\n\nJudul: ${title}\nPenulis: ${authors || 'Penulis ASIA'}\nJurnal: ${journal || 'ASIA Academic Journal'}\nDOI: https://doi.org/${doi || 'iaep.2026.verified'}\n\nBaca naskah lengkap: ${articleUrl || 'https://apasific.org'}\n\n#APASIFIC #JurnalIlmiah #RisetAkademik #PublikasiInternasional #OpenScience #AsiaPacificAcademician`;

    // Ensure cover URL is absolute
    let finalImageUrl = coverUrl || 'https://www.apasific.org/coverAJAF.png';
    if (!finalImageUrl.startsWith('http')) {
      finalImageUrl = `https://www.apasific.org${finalImageUrl.startsWith('/') ? '' : '/'}${finalImageUrl}`;
    }

    // 1. FACEBOOK PAGE PUBLISH
    if (platform === 'facebook') {
      const fbToken = process.env.FB_PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;
      const fbPageId = process.env.FB_PAGE_ID || '61593446475544';

      if (!fbToken) {
        return NextResponse.json({
          success: false,
          status: 'NEEDS_CREDENTIALS',
          message: 'Token API Facebook belum dikonfigurasi di server. Silakan tambahkan FB_PAGE_ACCESS_TOKEN pada file .env.',
          fallbackUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}&quote=${encodeURIComponent(`📚 Publikasi Ilmiah APASIFIC: ${title}`)}`
        });
      }

      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${fbPageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalImageUrl,
          message: defaultCaption,
          access_token: fbToken
        })
      });

      const fbData = await fbRes.json();
      if (!fbRes.ok || fbData.error) {
        return NextResponse.json({
          success: false,
          error: fbData.error?.message || 'Gagal memposting ke Facebook Page',
          fallbackUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        platform: 'facebook',
        postId: fbData.id || fbData.post_id,
        postUrl: `https://www.facebook.com/${fbPageId}`,
        message: 'Naskah berhasil diposting langsung ke Halaman Facebook APASIFIC!'
      });
    }

    // 2. INSTAGRAM FEED PUBLISH
    if (platform === 'instagram') {
      const igToken = process.env.META_ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN;
      const igUserId = process.env.IG_ACCOUNT_ID;

      if (!igToken || !igUserId) {
        return NextResponse.json({
          success: false,
          status: 'NEEDS_CREDENTIALS',
          message: 'Instagram Graph API belum dihubungkan. Silakan hubungkan IG_ACCOUNT_ID dan META_ACCESS_TOKEN di file .env server.',
          channelUrl: 'https://www.instagram.com/apasificacademician/'
        });
      }

      // Step 1: Create Container
      const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: finalImageUrl,
          caption: defaultCaption,
          access_token: igToken
        })
      });

      const containerData = await containerRes.json();
      if (!containerRes.ok || containerData.error || !containerData.id) {
        return NextResponse.json({
          success: false,
          error: containerData.error?.message || 'Gagal membuat container media Instagram',
          channelUrl: 'https://www.instagram.com/apasificacademician/'
        }, { status: 400 });
      }

      const creationId = containerData.id;

      // Step 2: Publish Media
      const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: igToken
        })
      });

      const publishData = await publishRes.json();
      if (!publishRes.ok || publishData.error) {
        return NextResponse.json({
          success: false,
          error: publishData.error?.message || 'Gagal mempublikasikan media ke Instagram feed',
          channelUrl: 'https://www.instagram.com/apasificacademician/'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        platform: 'instagram',
        mediaId: publishData.id,
        postUrl: 'https://www.instagram.com/apasificacademician/',
        message: 'Naskah berhasil diposting langsung ke Feed Instagram @apasificacademician!'
      });
    }

    // 3. TIKTOK PUBLISH
    if (platform === 'tiktok') {
      const tiktokToken = process.env.TIKTOK_ACCESS_TOKEN;

      if (!tiktokToken) {
        return NextResponse.json({
          success: false,
          status: 'NEEDS_CREDENTIALS',
          message: 'TikTok Content Posting API belum dihubungkan. Silakan hubungkan TIKTOK_ACCESS_TOKEN di file .env server.',
          channelUrl: 'https://www.tiktok.com/@apasificacademician'
        });
      }

      // Execute TikTok Direct Photo/Video Post Init
      const tiktokRes = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tiktokToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_info: {
            title: title.substring(0, 150),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_stitch: false,
            disable_comment: false,
            auto_add_music: true
          },
          source_info: {
            source: 'PULL_FROM_URL',
            photo_cover_index: 1,
            photo_images: [finalImageUrl]
          }
        })
      });

      const tiktokData = await tiktokRes.json();
      if (!tiktokRes.ok || tiktokData.error?.code !== 'ok') {
        return NextResponse.json({
          success: false,
          error: tiktokData.error?.message || 'Gagal memposting ke akun TikTok',
          channelUrl: 'https://www.tiktok.com/@apasificacademician'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        platform: 'tiktok',
        publishId: tiktokData.data?.publish_id,
        postUrl: 'https://www.tiktok.com/@apasificacademician',
        message: 'Naskah berhasil diposting langsung ke akun TikTok @apasificacademician!'
      });
    }

    return NextResponse.json({ error: `Platform '${platform}' not supported.` }, { status: 400 });
  } catch (err: any) {
    console.error('Social publish API error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
