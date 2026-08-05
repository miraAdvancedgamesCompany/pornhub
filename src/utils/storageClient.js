import { createStorageClient } from '../config/supabase'

// Cache for storage clients to avoid re-creating them
const clientCache = new Map()

/**
 * Get or create a Supabase storage client for a given account
 */
export function getStorageClient(account) {
  const key = account.supabase_url
  if (clientCache.has(key)) {
    return clientCache.get(key)
  }
  const client = createStorageClient(account.supabase_url, account.supabase_anon_key)
  clientCache.set(key, client)
  return client
}

/**
 * Upload a file to a specific storage account
 */
export async function uploadToStorage(account, filePath, file) {
  const client = getStorageClient(account)
  const { data, error } = await client.storage
    .from(account.bucket_name)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  if (error) throw error
  return data
}

/**
 * Get public URL from a storage account
 */
export function getPublicUrl(account, filePath) {
  const client = getStorageClient(account)
  const { data } = client.storage
    .from(account.bucket_name)
    .getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Delete a file from a storage account
 */
export async function deleteFromStorage(account, filePaths) {
  const client = getStorageClient(account)
  const { error } = await client.storage
    .from(account.bucket_name)
    .remove(filePaths)
  if (error) throw error
}

/**
 * Find the storage account with the most available space
 */
export function findLeastUsedAccount(accounts) {
  const activeAccounts = accounts.filter(a => a.is_active)
  if (activeAccounts.length === 0) return null
  
  return activeAccounts.reduce((best, current) => {
    const bestFree = best.max_storage - best.used_storage
    const currentFree = current.max_storage - current.used_storage
    return currentFree > bestFree ? current : best
  })
}
