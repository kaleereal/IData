import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        videos: {
          include: {
            video: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = artists.map((a) => {
      // Total score = SUM(earnedRating) from pivot snapshot table
      const overallRating = a.videos.reduce((sum, p) => sum + (p.earnedRating || 0), 0)
      const roundedOverall = Math.round(overallRating * 10) / 10

      let parsedLinks: string[] = []
      if (a.links) {
        try {
          parsedLinks = JSON.parse(a.links)
        } catch {
          parsedLinks = a.links.split('\n').filter(Boolean)
        }
      }

      let parsedGallery: string[] = []
      if (a.gallery) {
        try {
          parsedGallery = JSON.parse(a.gallery)
        } catch {
          parsedGallery = a.gallery.split('\n').filter(Boolean)
        }
      }

      return {
        ...a,
        overallRating: roundedOverall,
        videoCount: a.videos.length,
        linksList: parsedLinks,
        galleryList: parsedGallery,
      }
    })

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching artists' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, mainRole, avatarUrl, notes, links, gallery, customFields } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama artist wajib diisi' }, { status: 400 })
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        mainRole: mainRole || null,
        avatarUrl: avatarUrl || null,
        notes: notes || null,
        links: Array.isArray(links) ? JSON.stringify(links) : links || null,
        gallery: Array.isArray(gallery) ? JSON.stringify(gallery) : gallery || null,
        customFields: JSON.stringify(customFields || {}),
      },
    })

    return NextResponse.json(artist, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating artist' }, { status: 500 })
  }
}
