// Nome do repositório no GitHub (ex.: se a URL for
// https://usuario.github.io/etec-quest/, coloque "etec-quest" aqui).
// Se você configurar um domínio próprio (CNAME) no GitHub Pages, deixe "".
const REPO_NAME = "etec-quest";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages só serve arquivos estáticos: isso faz o "next build" gerar
  // uma pasta /out com HTML/CSS/JS puro, sem precisar de servidor Node.
  output: "export",
  trailingSlash: true,
  basePath: process.env.GITHUB_PAGES ? `/${REPO_NAME}` : "",
  assetPrefix: process.env.GITHUB_PAGES ? `/${REPO_NAME}/` : "",
  images: {
    // A exportação estática não suporta a otimização de imagem do Next.js.
    unoptimized: true,
  },
};

module.exports = nextConfig;
