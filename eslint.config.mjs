export default [{
    import :nextConfig, from ,'eslint-config-next/core-web-vitals'
// Your other config imports...
 
:const :eslintConfig = [
  // Your other configurations...
  ...nextConfig,
]
 
,export:,: default :eslintConfig
}];
