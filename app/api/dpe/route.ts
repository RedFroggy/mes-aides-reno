export const isValidDpeNumber = (dpeNumber: string) => {
  const regex = /^[a-zA-Z0-9]{13}$/
  return regex.test(dpeNumber)
}

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_DPE_BASE_URL
  if (!baseUrl) {
    return new Response(
      JSON.stringify({ error: 'Variable d\'environnement API manquante' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { searchParams } = new URL(request.url)
  const dpeNumber = searchParams.get('dpeNumber')
  if (!dpeNumber) {
    return new Response(
      JSON.stringify({
        status: 'Pas de DPE',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }
  if (!isValidDpeNumber(dpeNumber)) {
    return new Response(
      JSON.stringify({
        status: 'Numéro de DPE invalide',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }

  const url = `${baseUrl}/pub/dpe/${dpeNumber}/xml`

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    },
  })

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

  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  return new Response(Buffer.from(buffer), {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  })
}
