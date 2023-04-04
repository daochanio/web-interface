import { useState, useEffect } from 'react'

/**
 * Simple hook to determine if the component has mounted.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}
