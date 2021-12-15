// check if in prod mode
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  basePath: '',
  assetPrefix: '',
};
