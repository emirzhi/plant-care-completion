/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images:{
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'idjchiqyknpfgkhhmmgl.supabase.co',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;