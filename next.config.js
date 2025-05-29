/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // 启用静态导出配置
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  // 根据部署环境调整路径配置
  assetPrefix: process.env.NODE_ENV === 'production' ? (process.env.DEPLOY_PATH || '') : '',
  basePath: process.env.NODE_ENV === 'production' ? (process.env.DEPLOY_PATH || '') : '',
  env: {
    CUSTOM_KEY: 'slavopolis-docs',
  },
  webpack: (config, { isServer }) => {
    // 处理 MDX 文件
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        {
          loader: '@mdx-js/loader',
          options: {
            providerImportSource: '@mdx-js/react',
          },
        },
      ],
    });

    // 处理字体文件
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 