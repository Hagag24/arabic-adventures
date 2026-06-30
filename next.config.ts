import type { NextConfig } from "next";

const showNextDevtools = process.env.SHOW_NEXT_DEVTOOLS === "true";

const nextConfig: NextConfig = {
  devIndicators: showNextDevtools ? undefined : false,
  outputFileTracingIncludes: {
    "/*": ["./data/arabic-adventures.db"],
  },
  async redirects() {
    return [
      // Old journey redirects to new lesson roadmaps
      {
        source: "/journeys/ancient-egyptian-teacher",
        destination: "/lessons/ancient-egyptian-teacher",
        permanent: false,
      },
      {
        source: "/journeys/king-of-hearts",
        destination: "/lessons/magdi-yacoub",
        permanent: false,
      },
      // Old activity play links to new activity play links
      {
        source: "/journeys/ancient-egyptian-teacher/play/:activitySlug",
        destination: "/lessons/ancient-egyptian-teacher/activities/:activitySlug",
        permanent: false,
      },
      {
        source: "/journeys/king-of-hearts/play/:activitySlug",
        destination: "/lessons/magdi-yacoub/activities/:activitySlug",
        permanent: false,
      },
      // Legacy portals redirect to home
      {
        source: "/student/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/teacher/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
