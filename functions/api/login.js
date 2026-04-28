export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const username = body.username;
        const password = body.password;

        const user = await env.DB.prepare(
            "SELECT id, pass, salt FROM users WHERE name = ?"
        ).bind(username).first();

        if (!user) {
            return Response.json({ success: false });
        }

        const hash = await hashPassword(password, user.salt);

        if (hash === user.pass) {
            return Response.json({
                success: true,
                user_id: user.id
            });
        }

        return Response.json({ success: false });

    } catch (e) {
        return Response.json({
            success: false,
            error: "server_error"
        }, { status: 500 });
    }
}