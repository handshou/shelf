// host: "shelf-git-middleware-handshous-projects.vercel.app"
// referer: "https://shelf-git-middleware-handshous-projects.vercel.app/admin/index.html"
export function isAdmin({ host, referer }) {
  const urlSplit = host && referer?.split(host);
  for (let i = 0; urlSplit && i < urlSplit?.length; i++) {
    if (urlSplit)
      if (urlSplit[i]?.startsWith("/admin")) return true;
  }
  return false;
}
