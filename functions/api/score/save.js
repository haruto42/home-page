export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { user_id, score, time } = body;

    if (!user_id) {
      return Response.json({ success: false, error: "no_user" });
    }

    await env.DB.prepare(
      `INSERT INTO scores (user_id, score, time)
       VALUES (?, ?, ?)`
    )
      .bind(user_id, score, time)
      .run();

    return Response.json({ success: true });

  } catch (e) {
    return Response.json({
      success: false,
      error: "server_error"
    }, { status: 500 });
  }
}