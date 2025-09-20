/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@devpulse/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
