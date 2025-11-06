import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary configuration missing:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      })
      return NextResponse.json(
        { error: 'Server configuration error: Cloudinary not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('No file in request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Log file details
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type)
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size)
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Buffer created, size:', buffer.length)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fa-user-uploads',
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1600, crop: 'limit' }, // Limit max dimensions
            { quality: 'auto' }, // Auto quality optimization
            { fetch_format: 'auto' } // Auto format (WebP where supported)
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Upload successful:', {
              url: result?.secure_url,
              public_id: result?.public_id,
            })
            resolve(result)
          }
        }
      )
      uploadStream.end(buffer)
    })

    const uploadResult = result as any

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { 
        error: 'Failed to upload image', 
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}