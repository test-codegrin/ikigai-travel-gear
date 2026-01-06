const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};

export default nextConfig;
