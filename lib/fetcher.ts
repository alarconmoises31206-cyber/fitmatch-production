export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'x-api-secret': process.env.NEXT_PUBLIC_INCIDENT_API_SECRET || '',
    },
  })

  if (!res.ok) {
    throw new Error(\Failed to fetch \: \\)
  }

  return res.json()
}
