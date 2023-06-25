const path = require('path')
const withLess = require('next-with-less')
/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  swcMinify: true,
  webpack: (config, opts) => {
    config.resolve.alias['@'] = path.resolve(__dirname)
    config.module.rules.push({
      test: /\.svg$/,
      use:["@svgr/webpack"]
    })
    return config
  }
}

module.exports = withLess(nextConfig)
