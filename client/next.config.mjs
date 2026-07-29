/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',       // emit static HTML/CSS/JS into the `out/` folder
  trailingSlash: true,    // ensures /route/ index.html works on static hosts
};

export default nextConfig;
