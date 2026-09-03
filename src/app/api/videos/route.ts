import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateOverallVideoRating,
  calculateEarnedRating,
  getWeightForRoleStatus,
  cleanupUnusedRoleWeightConfigs,
  RatingFolder,
} from '@/lib/rating'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const filterTag = searchParams.get('tag') || ''
    const sort = searchParams.get('sort') || 'desc' // desc | asc | rating_desc | rating_asc

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    let videos = await prisma.video.findMany({
      where,
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    let formatted = videos.map((v) => {
      let folders: RatingFolder[] = []
      if (v.ratingData) {
        try {
          folders = JSON.parse(v.ratingData)
        } catch {}
      }

      let computedRating = calculateOverallVideoRating(folders)
      if (computedRating === 0 && v.overallRating) {
        computedRating = v.overallRating
      }

      let parsedCustomFields: Record<string, any> = {}
      if (v.customFields) {
        try {
          parsedCustomFields = JSON.parse(v.customFields)
        } catch {}
      }

      return {
        ...v,
        ratingFolders: folders,
        overallRating: computedRating,
        customFields: parsedCustomFields,
      }
    })

    if (filterTag) {
      formatted = formatted.filter((v) => {
        const cf = v.customFields
        if (!cf) return false
        return Object.values(cf).some((val) => {
          if (Array.isArray(val)) return val.includes(filterTag)
          return val === filterTag
        })
      })
    }

    if (sort === 'rating_desc') {
      formatted.sort((a, b) => b.overallRating - a.overallRating)
    } else if (sort === 'rating_asc') {
      formatted.sort((a, b) => a.overallRating - b.overallRating)
    }

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching videos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      url,
      title,
      notes,
      thumbnail,
      embedHtml,
      domain,
      ratingFolders,
      customFields,
      artistLinks, // array of { artistId: string, roleStatus?: string }
      artistIds,   // fallback array of string IDs
    } = body

    if (!url || !title) {
      return NextResponse.json({ error: 'URL dan judul wajib diisi' }, { status: 400 })
    }

    const folders: RatingFolder[] = ratingFolders || []
    const overallScore = calculateOverallVideoRating(folders)

    // Build artistLinks normalized list
    let linksToProcess: { artistId: string; roleStatus: string }[] = []
    if (Array.isArray(artistLinks) && artistLinks.length > 0) {
      linksToProcess = artistLinks.map((item: any) => ({
        artistId: item.artistId,
        roleStatus: (item.roleStatus || 'Artis Utama').trim(),
      }))
    } else if (Array.isArray(artistIds) && artistIds.length > 0) {
      linksToProcess = artistIds.map((id: string) => ({
        artistId: id,
        roleStatus: 'Artis Utama',
      }))
    }

    // Resolve weight and earned rating for each artist link snapshot
    const pivotCreates = await Promise.all(
      linksToProcess.map(async (item) => {
        const roleStatus = item.roleStatus || 'Artis Utama'
        const weight = await getWeightForRoleStatus(roleStatus)
        const earnedRating = calculateEarnedRating(overallScore, weight)

        return {
          artistId: item.artistId,
          roleStatus,
          weight,
          earnedRating,
        }
      })
    )

    const video = await prisma.video.create({
      data: {
        url,
        title,
        notes: notes || null,
        thumbnail: thumbnail || null,
        embedHtml: embedHtml || null,
        domain: domain || null,
        ratingData: JSON.stringify(folders),
        overallRating: overallScore,
        customFields: JSON.stringify(customFields || {}),
        artists: {
          create: pivotCreates.map((p) => ({
            artistId: p.artistId,
            roleStatus: p.roleStatus,
            weight: p.weight,
            earnedRating: p.earnedRating,
          })),
        },
      },
      include: {
        artists: {
          include: { artist: true },
        },
      },
    })

    await cleanupUnusedRoleWeightConfigs()

    return NextResponse.json(video, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating video' }, { status: 500 })
  }
}
