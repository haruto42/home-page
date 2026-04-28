import { hashPassword } from "../utils/hash.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { username, password } = await request.json();

        // 簡易チェック
        if (!username || !password) {
            return Response.json({ success: false, error: "invalid" });
        }

        // 既存チェック
        const exists = await env.DB.prepare(
            "SELECT id FROM users WHERE name = ?"
        )
        .bind(username)
        .first();

        if (exists) {
            return Response.json({ success: false, error: "exists" });
        }

        // ハッシュ生成
        const salt = crypto.randomUUID();
        const hash = await hashPassword(password, salt);

        // 保存
        await env.DB.prepare(
            "INSERT INTO users (name, pass, salt) VALUES (?, ?, ?)"
        )
        .bind(username, hash, salt)
        .run();

        return Response.json({ success: true });

    } catch (e) {
        return Response.json({ success: false, error: "server" });
    }
}