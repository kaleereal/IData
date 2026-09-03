import { prisma } from '@/lib/prisma'

export interface RatingItem {
  id: string
  name: string
  score: number // 0-100
}

export interface RatingFolder {
  id: string
  name: string
  items: RatingItem[]
}

/**
 * Calculates the overall rating score (0-100) from all items across all folders.
 * Returns 0 if there are no items.
 */
export function calculateOverallVideoRating(folders: RatingFolder[]): number {
  if (!folders || folders.length === 0) return 0

  let totalScore = 0
  let totalCount = 0

  for (const folder of folders) {
    if (folder.items && folder.items.length > 0) {
      for (const item of folder.items) {
        const val = Number(item.score)
        if (!isNaN(val)) {
          totalScore += Math.min(100, Math.max(0, val))
          totalCount += 1
        }
      }
    }
  }

  if (totalCount === 0) return 0
  return Math.round((totalScore / totalCount) * 10) / 10 // round to 1 decimal
}

/**
 * Formula: Nilai yang Didapat Artis = (Nilai Keseluruhan Video × Bobot Status Peran) / 100
 */
export function calculateEarnedRating(videoOverallRating: number, weight: number): number {
  const earned = (videoOverallRating * weight) / 100
  return Math.round(earned * 10) / 10
}

/**
 * Get color code or class based on rating score.
 * >80: Green, 50-80: Yellow, <50: Red
 */
export function getRatingBadgeClass(rating: number): string {
  if (rating >= 80) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  if (rating >= 50) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
  return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
}

/**
 * Helper to ensure a roleStatus exists in RoleWeightConfig.
 * Returns the weight assigned to this role status. Default weight = 100.
 */
export async function getWeightForRoleStatus(roleStatus: string): Promise<number> {
  const trimmed = roleStatus.trim()
  if (!trimmed) return 100

  const existing = await prisma.roleWeightConfig.findUnique({
    where: { roleStatus: trimmed },
  })

  if (existing) {
    return existing.weight
  }

  // Create new roleStatus config with default 100% weight
  const created = await prisma.roleWeightConfig.create({
    data: {
      roleStatus: trimmed,
      weight: 100,
      isLocked: false,
    },
  })

  return created.weight
}

/**
 * Clean up RoleWeightConfig entries that are no longer referenced in any VideoArtist pivot.
 */
export async function cleanupUnusedRoleWeightConfigs() {
  const activePivotRoles = await prisma.videoArtist.findMany({
    select: { roleStatus: true },
    distinct: ['roleStatus'],
  })

  const activeRoleNames = new Set(activePivotRoles.map((p) => p.roleStatus.trim()))

  const allConfigs = await prisma.roleWeightConfig.findMany()
  const toDelete = allConfigs.filter((c) => !activeRoleNames.has(c.roleStatus.trim()))

  if (toDelete.length > 0) {
    await prisma.roleWeightConfig.deleteMany({
      where: {
        id: { in: toDelete.map((c) => c.id) },
      },
    })
  }
}
