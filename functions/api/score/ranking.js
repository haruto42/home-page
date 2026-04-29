export async function onRequestGet(context) {
  const { env } = context;

  try {
    const result = await env.DB.prepare(`
      SELECT u.name, s.score, s.time
      FROM scores s
      JOIN users u ON u.id = s.user_id
      WHERE (s.user_id, s.score, s.time) IN (
        SELECT user_id, MAX(score), MIN(time)
        FROM scores
        GROUP BY user_id
      )
      ORDER BY s.score DESC, s.time ASC
      LIMIT 5
    `).all();

    return Response.json({
      success: true,
      ranking: result.results
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: "server_error"
    }, { status: 500 });
  }
}