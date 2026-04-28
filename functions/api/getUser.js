export async function onRequestGet(context) {
    const { request, env } = context;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return Response.json({ success: false });
    }

    const user = await env.DB.prepare(
        "SELECT name FROM users WHERE id = ?"
    )
    .bind(id)
    .first();

    if (!user) {
        return Response.json({ success: false });
    }

    return Response.json({
        success: true,
        name: user.name
    });
}