export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const username = body.username;
        const password = body.password;

        if (!username || !password) {
            return Response.json({ success: false });
        }

        const exists = await env.DB.prepare(
            "SELECT id FROM users WHERE name = ?"
        ).bind(username).first();

        if (exists) {
            return Response.json({ success: false, error: "exists" });
        }

        const salt = crypto.randomUUID();
        const hash = await hashPassword(password, salt);

        const result = await env.DB.prepare(
            "INSERT INTO users (name, pass, salt) VALUES (?, ?, ?)"
        ).bind(username, hash, salt).run();

        return Response.json({
            success: true,
            user_id: result.meta.last_row_id
        });

    } catch (e) {
        return Response.json({
            success: false,
            error: "server_error"
        }, { status: 500 });
    }
}