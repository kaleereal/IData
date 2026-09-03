import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        videos: {
          include: {
            video: {
              include: {
                artists: {
                  include: {
                    artist: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Total artist score is SUM(earnedRating) from pivot snapshot rows
    const overallRatingSum = artist.videos.reduce((sum, p) => sum + (p.earnedRating || 0), 0)
    const overallRating = Math.round(overallRatingSum * 10) / 10

    const linkedVideos = artist.videos.map((p) => {
      let customFieldsObj: Record<string, any> = {}
      if (p.video.customFields) {
        try {
          customFieldsObj = JSON.parse(p.video.customFields)
        } catch {}
      }

      return {
        id: p.video.id,
        title: p.video.title,
        thumbnail: p.video.thumbnail,
        url: p.video.url,
        videoOverallRating: p.video.overallRating,
        earnedRating: p.earnedRating,
        roleStatus: p.roleStatus,
        weight: p.weight,
        customFields: customFieldsObj,
      }
    })

    // Compute inherited tags from linked videos with rank positions
    // First, fetch all artists and their SUM(earnedRating) per tag to compute accurate leaderboard rank
    const allArtistsWithVideos = await prisma.artist.findMany({
      include: {
        videos: {
          include: {
            video: true,
          },
        },
      },
    })

    // Map each tag to a sorted list of { artistId, totalScoreForTag }
    const tagScoresMap: Record<string, Record<string, number>> = {}

    allArtistsWithVideos.forEach((art) => {
      art.videos.forEach((p) => {
        let cf: Record<string, any> = {}
        if (p.video.customFields) {
          try {
            cf = JSON.parse(p.video.customFields)
          } catch {}
        }

        Object.values(cf).forEach((val) => {
          const tags = Array.isArray(val) ? val : [val]
          tags.forEach((tagStr) => {
            if (typeof tagStr === 'string' && tagStr.trim()) {
              const tag = tagStr.trim()
              if (!tagScoresMap[tag]) tagScoresMap[tag] = {}
              tagScoresMap[tag][art.id] = (tagScoresMap[tag][art.id] || 0) + (p.earnedRating || 0)
            }
          })
        })
      })
    })

    // Determine current artist's rank position for each tag inherited from linked videos
    const inheritedTagRanks: { tag: string; rank: number; totalScore: number }[] = []

    // Collect tags inherited by current artist
    const currentArtistTags = new Set<string>()
    linkedVideos.forEach((v) => {
      Object.values(v.customFields).forEach((val) => {
        const tags = Array.isArray(val) ? val : [val]
        tags.forEach((tagStr) => {
          if (typeof tagStr === 'string' && tagStr.trim()) {
            currentArtistTags.add(tagStr.trim())
          }
        })
      })
    })

    currentArtistTags.forEach((tag) => {
      const artistScoresObj = tagScoresMap[tag] || {}
      const sortedByScore = Object.entries(artistScoresObj).sort((a, b) => b[1] - a[1])
      const rankIdx = sortedByScore.findIndex(([aId]) => aId === artist.id)
      const rankPos = rankIdx !== -1 ? rankIdx + 1 : 1
      const totalScore = artistScoresObj[artist.id] || 0

      inheritedTagRanks.push({
        tag,
        rank: rankPos,
        totalScore: Math.round(totalScore * 10) / 10,
      })
    })

    inheritedTagRanks.sort((a, b) => a.rank - b.rank)

    let parsedLinks: string[] = []
    if (artist.links) {
      try {
        parsedLinks = JSON.parse(artist.links)
      } catch {
        parsedLinks = artist.links.split('\n').filter(Boolean)
      }
    }

    let parsedGallery: string[] = []
    if (artist.gallery) {
      try {
        parsedGallery = JSON.parse(artist.gallery)
      } catch {
        parsedGallery = artist.gallery.split('\n').filter(Boolean)
      }
    }

    return NextResponse.json({
      ...artist,
      overallRating,
      linksList: parsedLinks,
      galleryList: parsedGallery,
      linkedVideos,
      inheritedTagRanks,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching artist' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, mainRole, avatarUrl, notes, links, gallery, customFields } = body

    const updated = await prisma.artist.update({
      where: { id },
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

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating artist' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.artist.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting artist' }, { status: 500 })
  }
}
