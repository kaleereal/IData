import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const targetType = searchParams.get('targetType') // "VIDEO" or "ARTIST"

    const where: any = {}
    if (targetType) {
      where.targetType = targetType
    }

    const configs = await prisma.customFieldConfig.findMany({
      where,
      orderBy: { position: 'asc' },
    })

    const formatted = configs.map((c) => {
      let parsedOptions: any = null
      let optionsList: string[] = []

      if (c.options) {
        try {
          if (c.options.trim().startsWith('{') || c.options.trim().startsWith('[')) {
            parsedOptions = JSON.parse(c.options)
            if (Array.isArray(parsedOptions)) {
              optionsList = parsedOptions.map((opt: any) =>
                typeof opt === 'string' ? opt : opt.name || opt.label || opt.code || ''
              )
            } else if (parsedOptions && typeof parsedOptions === 'object' && parsedOptions.categories) {
              const items: string[] = []
              parsedOptions.categories.forEach((cat: any) => {
                if (Array.isArray(cat.items)) {
                  cat.items.forEach((it: any) => {
                    const label = typeof it === 'string' ? it : it.name || it.label || it.code || ''
                    if (label) items.push(label)
                  })
                }
              })
              optionsList = items
            }
          } else {
            optionsList = c.options.split(',').map((s) => s.trim()).filter(Boolean)
          }
        } catch {
          optionsList = c.options.split(',').map((s) => s.trim()).filter(Boolean)
        }
      }

      return {
        ...c,
        optionsList,
        parsedOptions,
      }
    })

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching field configs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { targetType, name, description, fieldType, options, position, maxEntries } = body

    if (!targetType || !name || !fieldType) {
      return NextResponse.json({ error: 'Target type, name, and field type are required' }, { status: 400 })
    }

    const newConfig = await prisma.customFieldConfig.create({
      data: {
        targetType,
        name,
        description: description || null,
        fieldType,
        options: typeof options === 'object' ? JSON.stringify(options) : Array.isArray(options) ? options.join(', ') : options || null,
        position: typeof position === 'number' ? position : 0,
        maxEntries: maxEntries ? Number(maxEntries) : null,
      },
    })

    return NextResponse.json(newConfig, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating config' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    if (Array.isArray(body)) {
      const updates = body.map((item: any, index: number) =>
        prisma.customFieldConfig.update({
          where: { id: item.id },
          data: { position: index },
        })
      )
      await prisma.$transaction(updates)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating config' }, { status: 500 })
  }
}
