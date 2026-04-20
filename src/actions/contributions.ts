'use server'

import { connectDB } from '@/lib/db'
import { getAuthUser } from '@/lib/session'
import User from '@/models/User'
import Charity from '@/models/Charity'
import ContributionLog from '@/models/contributionLog'
import type { ActionResult } from '@/types/auth'

const PLAN_AMOUNT: Record<string, number> = {
  monthly: Number(process.env.RAZORPAY_MONTHLY_AMOUNT) || 99900,
  yearly: Math.floor((Number(process.env.RAZORPAY_YEARLY_AMOUNT) || 999900) / 12),
}

export interface ContributionSummary {
  month: number
  year: number
  totalSubscribers: number
  subscribersWithCharity: number
  subscribersWithoutCharity: number
  totalContributedPaise: number
  charityBreakdown: {
    charityId: string
    charityName: string
    contributionPaise: number
    contributorCount: number
  }[]
}

export async function triggerMonthlyContributionsAction(): Promise<
  ActionResult<ContributionSummary>
> {
  const auth = await getAuthUser()
  if (!auth || auth.role !== 'admin') {
    return { error: true, message: 'Admin access required' }
  }

  try {
    await connectDB()

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    // ── Duplicate run prevention ──────────────────────────────────────────
    // Check if already triggered this month
    const alreadyRun = await ContributionLog.findOne({ month, year })
    if (alreadyRun) {
      return {
        error: true,
        message: `Contributions for ${month}/${year} were already processed on ${new Date(alreadyRun.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
          }`,
      }
    }

    // ── Fetch active subscribers ──────────────────────────────────────────
    const allActive = await User.find({ subscriptionStatus: 'active' }).lean()
    const withCharity = allActive.filter((u) => u.selectedCharityId)
    const withoutCharity = allActive.filter((u) => !u.selectedCharityId)

    if (withCharity.length === 0) {
      return { error: true, message: 'No active subscribers with a charity selected' }
    }

    // ── Build charity contribution map ────────────────────────────────────
    const charityMap = new Map<string, { totalPaise: number; count: number }>()

    for (const user of withCharity) {
      const charityId = user.selectedCharityId!.toString()
      const planAmount = PLAN_AMOUNT[(user as any).subscriptionPlan ?? 'monthly'] ?? PLAN_AMOUNT.monthly
      const contribution = Math.floor(planAmount * (user.charityContributionPercent / 100))

      const existing = charityMap.get(charityId) ?? { totalPaise: 0, count: 0 }
      charityMap.set(charityId, {
        totalPaise: existing.totalPaise + contribution,
        count: existing.count + 1,
      })
    }

    // ── Bulk update charity totalRaised ───────────────────────────────────
    await Promise.all(
      Array.from(charityMap.entries()).map(([charityId, { totalPaise }]) =>
        Charity.findByIdAndUpdate(charityId, { $inc: { totalRaised: totalPaise } })
      )
    )

    const totalContributedPaise = Array.from(charityMap.values())
      .reduce((sum, c) => sum + c.totalPaise, 0)

    // ── Write log ─────────────────────────────────────────────────────────
    // Unique index on month+year is the hard DB-level guard
    // If two admins somehow trigger simultaneously, second insert throws
    // duplicate key error caught below
    await ContributionLog.create({
      month,
      year,
      totalContributedPaise,
      subscriberCount: withCharity.length,
      charityCount: charityMap.size,
      triggeredBy: auth.userId,
    })

    // ── Build breakdown for UI ────────────────────────────────────────────
    const charityBreakdown = await Promise.all(
      Array.from(charityMap.entries()).map(async ([charityId, { totalPaise, count }]) => {
        const charity = await Charity.findById(charityId).select('name').lean()
        return {
          charityId,
          charityName: charity?.name ?? 'Unknown',
          contributionPaise: totalPaise,
          contributorCount: count,
        }
      })
    )

    return {
      error: false,
      message: 'Success',
      data: {
        month,
        year,
        totalSubscribers: allActive.length,
        subscribersWithCharity: withCharity.length,
        subscribersWithoutCharity: withoutCharity.length,
        totalContributedPaise,
        charityBreakdown,
      },
    }
  } catch (err: any) {
    // MongoDB duplicate key — race condition
    if (err?.code === 11000) {
      return { error: true, message: 'Contributions for this month were just processed by another admin' }
    }
    console.error('[triggerMonthlyContributionsAction]', err)
    return { error: true, message: err?.message ?? 'Failed to process contributions' }
  }
}

// ─── Get last run info ────────────────────────────────────────────────────────

export async function getLastContributionRunAction(): Promise<
  ActionResult<{
    month: number
    year: number
    createdAt: string
    totalContributedPaise: number
  } | null>
> {
  const auth = await getAuthUser()
  if (!auth || auth.role !== 'admin') return { error: true, message: 'Admin access required' }

  try {
    await connectDB()
    const last = await ContributionLog.findOne()
      .sort({ year: -1, month: -1 })
      .lean()

    if (!last) return { error: false, message: 'Success', data: null }

    return {
      error: false,
      message: 'Success',
      data: {
        month: last.month,
        year: last.year,
        createdAt: last.createdAt.toISOString(),
        totalContributedPaise: last.totalContributedPaise,
      },
    }
  } catch (err: any) {
    return { error: true, message: err?.message ?? 'Failed' }
  }
}