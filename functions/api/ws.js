// Cloudflare Pages Function - WebSocket echo server
//
// wss://<your-domain>/api/ws に接続すると、送ったメッセージをそのまま
// タイムスタンプ付きで返す。接続テスト・フィルタリング確認用。

function timestamp() {
	return new Date().toISOString();
}

export async function onRequest(context) {
	const { request } = context;

	const upgradeHeader = request.headers.get("Upgrade");
	if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
		return new Response("Expected Upgrade: websocket", { status: 426 });
	}

	const webSocketPair = new WebSocketPair();
	const [client, server] = Object.values(webSocketPair);

	server.accept();

	console.log(`[ws] connection opened at ${timestamp()}`);

	server.send(
		JSON.stringify({
			type: "welcome",
			message: "接続成功。メッセージを送るとエコーが返ります。",
			time: timestamp(),
		})
	);

	server.addEventListener("message", (event) => {
		const receivedAt = timestamp();
		let payload;

		try {
			// JSONで来た場合はそのまま中身を見せる、そうでなければ生テキスト扱い
			payload = JSON.parse(event.data);
		} catch (err) {
			payload = event.data;
		}

		console.log(`[ws] message received at ${receivedAt}:`, payload);

		server.send(
			JSON.stringify({
				type: "echo",
				received: payload,
				time: receivedAt,
			})
		);
	});

	server.addEventListener("close", (event) => {
		console.log(
			`[ws] connection closed at ${timestamp()} code=${event.code} reason=${event.reason}`
		);
	});

	server.addEventListener("error", (event) => {
		console.log(`[ws] error at ${timestamp()}:`, event);
	});

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}
