export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const user_id = url.searchParams.get("user_id");
    const mode = url.searchParams.get("mode") || "5q";

    // =====================
    // 上位5件
    // =====================
    const top = await env.DB.prepare(`
      SELECT u.name, s.user_id, s.score, s.time
      FROM scores s
      JOIN users u ON u.id = s.user_id
      WHERE s.mode = ?
      ORDER BY s.score DESC, s.time ASC
      LIMIT 5
    `).bind(mode).all();

    let myRank = null;

    // =====================
    // 自分の順位
    // =====================
    if (user_id) {
      const me = await env.DB.prepare(`
        SELECT score, time
        FROM scores
        WHERE user_id = ? AND mode = ?
      `).bind(user_id, mode).first();

      if (me) {
        const rankRes = await env.DB.prepare(`
          SELECT COUNT(*) + 1 AS rank
          FROM scores
          WHERE mode = ?
          AND (
            score > ?
            OR (score = ? AND time < ?)
          )
        `)
          .bind(mode, me.score, me.score, me.time)
          .first();

        myRank = {
          rank: rankRes.rank,
          score: me.score,
          time: me.time
        };
      }
    }

    return Response.json({
      success: true,
      top: top.results,
      myRank
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}