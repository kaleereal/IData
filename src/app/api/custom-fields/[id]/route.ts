import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, fieldType, options, maxEntries } = body

    const updated = await prisma.customFieldConfig.update({
      where: { id },
      data: {
        name,
        description: description || null,
        fieldType,
        options: typeof options === 'object' ? JSON.stringify(options) : Array.isArray(options) ? options.join(', ') : options || null,
        maxEntries: maxEntries ? Number(maxEntries) : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating config' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.customFieldConfig.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting config' }, { status: 500 })
  }
}
