import { hashPassword } from "../utils/hash.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    const { username, password } = await request.json();

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
    )
    .bind(username, hash, salt)
    .run();

    // ★ ここ追加（last_row_id）
    return Response.json({
        success: true,
        user_id: result.meta.last_row_id
    });
}