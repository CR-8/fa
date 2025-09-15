export async function uploadImage(file: File): Promise<{ url: string; public_id: string } | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return {
      url: result.url,
      public_id: result.public_id,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}