import { v2 as cloudinary } from 'cloudinary'

if (
    !process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET
) {
    throw new Error('Cannot found cloudinary api keys')
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Upload the file buffer to cloudinary 
 * Return the secure url of the uploaded  asset
 */

export async function uploadToCloudinary(
    buffer: Buffer,
    options: {
        folder: string
        filename: string
        allowedFormat?: string[]
        maxBytes?: number
    }
): Promise<string> {
    const { folder, filename, allowedFormat = ['jpg', 'png', 'jpeg', 'webp'], maxBytes = 5 * 1024 * 1024 } = options

    if (buffer.byteLength > maxBytes) {
        throw new Error('File is too large Maximum size if ' + maxBytes / 1024 * 1024 + 'MB')
    }
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: `golf/${folder}`, public_id: filename, allowed_formats: allowedFormat, overwrite: true, resource_type: 'image'
        }, (error, res) => {
            if (error || !res) {
                reject(error ?? new Error('Cloudinary Upload Failed'))
                return
            }
            resolve(res?.secure_url)
        })
        uploadStream.end(buffer)
    })
}


/**
 * Delete All Assets from cloudinary by it's public Id 
 * Pass the full public _ id including folder - foldername/filename
 */

export async function deleteFromCloud(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(`golf/${publicId}`, {
        invalidate: true, //clear the cache
        resource_type: 'image'
    })
}

export default cloudinary