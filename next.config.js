/** @type {import('next').NextConfig} */
const nextConfig = {
  // 合并所有 experimental 配置
  experimental: {
    serverComponentsExternalPackages: [],
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
  
  // 禁用自动URL编码
  compress: true,
  poweredByHeader: false,
  
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
  // 注意：在静态导出模式下 headers 配置不会生效
};

module.exports = nextConfig; 