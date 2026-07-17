import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

/**
 * useCourses — Fetch les formations depuis GET /api/courses
 * Gère: loading, error, et refetch avec filtres dynamiques.
 */
export function useCourses(filters = {}) {
  const [courses,  setCourses]  = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.category && filters.category !== 'Tous') params.append('category', filters.category)
      if (filters.level    && filters.level    !== 'Tous') params.append('level',    filters.level)
      if (filters.search)   params.append('search', filters.search)

      const { data } = await api.get(`/courses?${params}`)
      setCourses(data.courses || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Impossible de charger les formations. Vérifiez votre connexion et que le serveur est démarré.'
      )
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [filters.category, filters.level, filters.search])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  return { courses, total, loading, error, refetch: fetchCourses }
}
