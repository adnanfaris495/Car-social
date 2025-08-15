import { supabase } from './supabase'

export async function uploadImage(file: File, bucket: string): Promise<string> {
  try {
    // Verify file is valid
    if (!file) {
      throw new Error('No file provided')
    }

    // Verify file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type for ${file.name}. Allowed types are: ${allowedTypes.join(', ')}`)
    }

    // Verify file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error(`File ${file.name} exceeds 5MB limit`)
    }

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to upload images')
    }

    // Upload file
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    return filePath
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export async function uploadImages(files: File[], bucket: string): Promise<string[]> {
  try {
    // Verify files are valid
    if (!files.length) {
      throw new Error('No files provided')
    }

    // Verify file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type for ${file.name}. Allowed types are: ${allowedTypes.join(', ')}`)
      }
    }

    // Verify file sizes (5MB limit each)
    const maxSize = 5 * 1024 * 1024 // 5MB
    for (const file of files) {
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 5MB limit`)
      }
    }

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to upload images')
    }

    // Upload each file
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      return filePath
    })

    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Error uploading images:', error)
    throw error
  }
}

export async function deleteImage(path: string, bucket: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

export function getImageUrl(path: string, bucket: string): string {
  if (!path) return ''
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export function getImageUrls(paths: string[], bucket: string): string[] {
  return paths.map(path => getImageUrl(path, bucket))
}

// Helper functions for specific bucket types
export async function uploadCarImage(file: File): Promise<string> {
  return uploadImage(file, 'cars')
}

export async function uploadPostImage(file: File): Promise<string> {
  return uploadImage(file, 'post-images')
}

export async function uploadMarketplaceImages(files: File[]): Promise<string[]> {
  return uploadImages(files, 'post-images') // Using post-images for marketplace
}

export function getCarImageUrl(path: string): string {
  return getImageUrl(path, 'cars')
}

export function getPostImageUrl(path: string): string {
  return getImageUrl(path, 'post-images')
} 