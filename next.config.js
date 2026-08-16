/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Nominee photos come from wherever your admin panel uploads them to
      // (see the backend README re: photo_url). Add your real image host(s)
      // here - Unsplash is left in only because the sample/demo data uses it.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;
