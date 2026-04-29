export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { user_id, score, time, mode } = body;

    if (!user_id || !mode) {
      return Response.json({ success: false, error: "no_user_or_mode" });
    }

    if (
      typeof score !== "number" ||
      typeof time !== "number" ||
      score < 0 ||
      time <= 0
    ) {
      return Response.json({ success: false, error: "invalid_data" });
    }

    // ★既存データ取得
    const existing = await env.DB.prepare(`
      SELECT score, time
      FROM scores
      WHERE user_id = ? AND mode = ?
    `)
      .bind(user_id, mode)
      .first();

    // ★更新判定
    let shouldUpdate = false;

    if (!existing) {
      shouldUpdate = true;
    } else if (
      score > existing.score ||
      (score === existing.score && time < existing.time)
    ) {
      shouldUpdate = true;
    }

    // ★更新 or 何もしない
    if (shouldUpdate) {
      await env.DB.prepare(`
        INSERT INTO scores (user_id, score, time, mode)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, mode)
        DO UPDATE SET
          score = excluded.score,
          time = excluded.time,
          created_at = CURRENT_TIMESTAMP
      `)
        .bind(user_id, score, time, mode)
        .run();
    }

    return Response.json({
      success: true,
      updated: shouldUpdate
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}