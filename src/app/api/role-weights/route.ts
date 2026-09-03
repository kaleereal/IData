import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateEarnedRating, cleanupUnusedRoleWeightConfigs } from '@/lib/rating'

export async function GET() {
  try {
    const configs = await prisma.roleWeightConfig.findMany({
      orderBy: { roleStatus: 'asc' },
    })
    return NextResponse.json(configs)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching role weights' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, weight, isLocked } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (typeof weight === 'number') {
      updateData.weight = Math.min(100, Math.max(0, weight))
    }
    if (typeof isLocked === 'boolean') {
      updateData.isLocked = isLocked
    }

    const updated = await prisma.roleWeightConfig.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating role weight' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json()

    if (action === 'recalculate_all') {
      // Fetch all role weight configs
      const configs = await prisma.roleWeightConfig.findMany()
      const configMap = new Map<string, { weight: number; isLocked: boolean }>()
      configs.forEach((c) => {
        configMap.set(c.roleStatus.trim(), { weight: c.weight, isLocked: c.isLocked })
      })

      // Fetch all video artists with video overall score
      const pivots = await prisma.videoArtist.findMany({
        include: {
          video: {
            select: { overallRating: true },
          },
        },
      })

      let updatedCount = 0

      for (const p of pivots) {
        const roleKey = p.roleStatus.trim()
        const cfg = configMap.get(roleKey)

        // Skip recalculate if role config is locked
        if (cfg && cfg.isLocked) {
          continue
        }

        const currentWeight = cfg ? cfg.weight : p.weight
        const newEarned = calculateEarnedRating(p.video.overallRating, currentWeight)

        if (p.weight !== currentWeight || p.earnedRating !== newEarned) {
          await prisma.videoArtist.update({
            where: {
              videoId_artistId: {
                videoId: p.videoId,
                artistId: p.artistId,
              },
            },
            data: {
              weight: currentWeight,
              earnedRating: newEarned,
            },
          })
          updatedCount++
        }
      }

      await cleanupUnusedRoleWeightConfigs()

      return NextResponse.json({ success: true, recalculatedCount: updatedCount })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error recalculating role weights' }, { status: 500 })
  }
}
