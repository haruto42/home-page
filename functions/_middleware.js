export function onRequest(context) {
  const url = new URL(context.request.url);

  // ルート（/）に来たら /home/ にリダイレクト
  if (url.pathname === "/" || url.pathname === "") {
    return Response.redirect(new URL("/home/", url).toString(), 302);
  }

  // それ以外はそのまま
  return context.next();
}