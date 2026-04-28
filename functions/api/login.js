import { hashPassword } from "../utils/hash.js";

export async function onRequestPost(context) {
    const { request, env } = context;
    const { username, password } = await request.json();

    // まずユーザー取得
    const user = await env.DB.prepare(
        "SELECT id, pass, salt FROM users WHERE name = ?"
    )
    .bind(username)
    .first();

    if (!user) {
        return Response.json({ success: false });
    }

    // ハッシュ計算
    const hash = await hashPassword(password, user.salt);

    if (hash === user.pass) {
        return Response.json({
            success: true,
            user_id: user.id
        });
    }

    return Response.json({ success: false });
}