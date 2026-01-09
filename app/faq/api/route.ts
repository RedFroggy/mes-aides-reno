let { MAIR_GITHUB_TOKEN, MAIR_GITHUB_API_BASE } = process.env

export async function GET(request: Request) {
  const { repo, title, body, labels } = Object.fromEntries(
    request.nextUrl.searchParams.entries()
  );

  const url = `${MAIR_GITHUB_API_BASE}/${repo}/issues`
  const options = {
    method: 'POST',
    headers: {
      Authorization: `token ${MAIR_GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title,
      body,
      labels: (labels && labels.split(',')) || ['Contribution'],
    }),
  };

  try {
    const request = await fetch(url, options)
    const json = await request.json();

    if (!request.ok) {
      // Retourne une erreur avec le status et le message de l'API GitHub
      return Response.json(
        { error: json.message || 'Failed to create issue' },
        { status: request.status }
      );
    }

    return Response.json({ url: json['html_url'] })
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
