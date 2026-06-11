module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // Reanimated 4 ships its worklets plugin via the react-native-worklets package.
    // It MUST be the last plugin in this list.
    plugins: ['react-native-worklets/plugin'],
  };
};
