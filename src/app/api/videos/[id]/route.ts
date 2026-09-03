import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateOverallVideoRating,
  calculateEarnedRating,
  getWeightForRoleStatus,
  cleanupUnusedRoleWeightConfigs,
  RatingFolder,
} from '@/lib/rating'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        artists: {
          include: { artist: true },
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    let folders: RatingFolder[] = []
    if (video.ratingData) {
      try {
        folders = JSON.parse(video.ratingData)
      } catch {}
    }

    let parsedCustomFields: Record<string, any> = {}
    if (video.customFields) {
      try {
        parsedCustomFields = JSON.parse(video.customFields)
      } catch {}
    }

    return NextResponse.json({
      ...video,
      ratingFolders: folders,
      overallRating: calculateOverallVideoRating(folders),
      customFields: parsedCustomFields,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching video' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
      artistIds,   // fallback array
    } = body

    const folders: RatingFolder[] = ratingFolders || []
    const overallScore = calculateOverallVideoRating(folders)

    let linksToProcess: { artistId: string; roleStatus: string }[] = []
    if (Array.isArray(artistLinks) && artistLinks.length > 0) {
      linksToProcess = artistLinks.map((item: any) => ({
        artistId: item.artistId,
        roleStatus: (item.roleStatus || 'Artis Utama').trim(),
      }))
    } else if (Array.isArray(artistIds) && artistIds.length > 0) {
      linksToProcess = artistIds.map((idStr: string) => ({
        artistId: idStr,
        roleStatus: 'Artis Utama',
      }))
    }

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

    // Delete existing relation links first
    await prisma.videoArtist.deleteMany({
      where: { videoId: id },
    })

    const updated = await prisma.video.update({
      where: { id },
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

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating video' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.video.delete({
      where: { id },
    })
    await cleanupUnusedRoleWeightConfigs()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting video' }, { status: 500 })
  }
}
