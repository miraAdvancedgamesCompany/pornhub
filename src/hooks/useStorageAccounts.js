import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

export function useStorageAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('storage_accounts')
        .select('*')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setAccounts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return { accounts, loading, error, refetch: fetchAccounts }
}
