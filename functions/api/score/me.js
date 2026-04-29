export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    // クエリから user_id 取得
    const url = new URL(request.url);
    const user_id = url.searchParams.get("user_id");

    if (!user_id) {
      return Response.json({ success: false, error: "no_user" });
    }

    // ===== 自己ベスト取得 =====
    const result = await env.DB.prepare(`
      SELECT score, time
      FROM scores
      WHERE user_id = ?
      ORDER BY score DESC, time ASC
      LIMIT 1
    `)
      .bind(user_id)
      .first();

    return Response.json({
      success: true,
      best: result || null
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: "server_error"
    }, { status: 500 });
  }
}