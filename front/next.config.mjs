/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita output standalone para Docker otimizado
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stdev2495531.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["stdev2495531.blob.core.windows.net"],
  },
};

export default nextConfig;
