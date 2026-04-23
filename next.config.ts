import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "react-markdown",
    "remark-gfm",
    "remark-parse",
    "unified",
    "vfile",
    "mdast-util-from-markdown",
    "micromark",
  ],
};

export default nextConfig;
