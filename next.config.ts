import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // kokoro-js pulls in @huggingface/transformers + onnxruntime-node for server
  // usage. We only call it from the browser, so keep these out of the server
  // bundle to avoid native-binding errors during build.
  serverExternalPackages: ["onnxruntime-node", "@huggingface/transformers", "kokoro-js"],
};

export default nextConfig;
