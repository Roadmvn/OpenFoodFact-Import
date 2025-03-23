module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@services': './src/services',
            '@assets': './assets',
            '@config': './src/config',
            '@hooks': './src/hooks'
          }
        }
      ],
      ["@babel/plugin-transform-private-methods", { "loose": true }],
      ["@babel/plugin-transform-class-properties", { "loose": true }],
      ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
    ]
  };
};
