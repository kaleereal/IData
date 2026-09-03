'use client'

import VideoFormPage from '../../new/page'

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  return <VideoFormPage params={params} />
}
