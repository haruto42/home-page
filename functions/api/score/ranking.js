export async function onRequestGet(context) {
  const { env } = context;

  const result = await env.DB.prepare(`
    SELECT u.name, s.score, s.time
    FROM scores s
    JOIN users u ON u.id = s.user_id
    WHERE s.mode = '5q'
    ORDER BY s.score DESC, s.time ASC
    LIMIT 5
  `).all();

  return Response.json({
    success: true,
    ranking: result.results
  });
}