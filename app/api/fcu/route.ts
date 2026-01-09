export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_FC_BASE_URL
  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Variable d\'environnement API manquante' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  if (!lat || !lon) {
    return new Response(
      JSON.stringify({
        status: 'Pas de coordonnées géographiques',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  const response = await fetch(
    `${baseUrl}/api/v1/eligibility?lat=${lat}&lon=${lon}`,
  )
  if (!response.ok) {
    return new Response(
      JSON.stringify({
        error: response.ok,
        status: response.status,
        statusText: response.statusText,
      }),
      {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  return Response.json(await response.json())
}
