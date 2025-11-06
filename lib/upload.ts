export async function uploadImage(file: File): Promise<{ url: string; public_id: string } | null> {
  try {
    console.log('Starting upload for file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    console.log('Upload response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })
      throw new Error(errorData.error || `Upload failed with status ${response.status}`)
    }

    const result = await response.json()
    console.log('Upload successful:', {
      url: result.url,
      public_id: result.public_id,
    })

    return {
      url: result.url,
      public_id: result.public_id,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return null
  }
}