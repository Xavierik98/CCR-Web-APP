import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ccr/database", "@ccr/ui"],
  webpack: (config, { isServer }) => {
    // En monorepo pnpm, Next.js n'embarque pas seul le moteur Prisma dans la
    // fonction serveur : ce plugin le copie à côté du code compilé.
    if (isServer) config.plugins = [...config.plugins, new PrismaPlugin()];
    return config;
  },
};

export default nextConfig;
