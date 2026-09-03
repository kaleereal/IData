import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL field is required' }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const domain = parsedUrl.hostname.replace(/^www\./, '')
    let title = ''
    let thumbnail = ''
    let embedHtml = ''

    // YouTube handler
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        )
        if (oembedRes.ok) {
          const data = await oembedRes.json()
          title = data.title || ''
          thumbnail = data.thumbnail_url || ''
          embedHtml = data.html || ''
        }
      } catch (err) {
        console.error('YouTube oembed error:', err)
      }

      if (!thumbnail) {
        let videoId = ''
        if (domain.includes('youtu.be')) {
          videoId = parsedUrl.pathname.slice(1)
        } else {
          videoId = parsedUrl.searchParams.get('v') || ''
        }
        if (videoId) {
          thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
        }
      }
    } else if (domain.includes('vimeo.com')) {
      try {
        const oembedRes = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
        )
        if (oembedRes.ok) {
          const data = await oembedRes.json()
          title = data.title || ''
          thumbnail = data.thumbnail_url || ''
          embedHtml = data.html || ''
        }
      } catch (err) {
        console.error('Vimeo oembed error:', err)
      }
    } else {
      // General website HTML scraping fallback for OpenGraph metadata
      try {
        const htmlRes = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
          },
        })

        if (htmlRes.ok) {
          const htmlText = await htmlRes.text()

          // Extract title
          const ogTitleMatch = htmlText.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
            htmlText.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
          const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i)
          title = ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : '')

          // Extract thumbnail
          const ogImageMatch = htmlText.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
            htmlText.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
          if (ogImageMatch) {
            thumbnail = ogImageMatch[1]
          }
        }
      } catch (err) {
        console.error('HTML scrape error:', err)
      }
    }

    if (!title) {
      title = domain
    }

    return NextResponse.json({
      title,
      thumbnail,
      embedHtml,
      domain,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
