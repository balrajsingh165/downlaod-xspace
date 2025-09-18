/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove deprecated experimental.appDir (it's now default in Next.js 14)
    // Remove deprecated api.bodyParser (not needed for App Router)

    // Add allowedDevOrigins to fix the cross-origin warning
    allowedDevOrigins: ['151.245.184.3'],

    // Configure for better performance
    images: {
        domains: [],
    },
}

module.exports = nextConfig
