import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fiber & Electric Solutions Ltd.",
    short_name: "FES",
    description: "Electrical and fibre optic services in Trinidad & Tobago.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f0eb",
    theme_color: "#7d1028",
    icons: [
      { src: "/icon.png", sizes: "1240x1240", type: "image/png", purpose: "any" },
    ],
  };
}
