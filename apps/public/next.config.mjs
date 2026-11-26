/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ccr/ui"],
  async redirects() {
    return [
      {
        source: "/qui-sommes-nous",
        destination: "/a-propos",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
