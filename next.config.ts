import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/student",
        destination: "/",
        permanent: true,
      },
      {
        source: "/student/journeys",
        destination: "/",
        permanent: true,
      },
      {
        source: "/teacher",
        destination: "/",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/",
        permanent: true,
      },
      {
        source: "/student/journeys/:journeySlug",
        destination: "/journeys/:journeySlug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
