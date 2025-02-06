module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      
      plugins: [
        ["module:react-native-dotenv"], // Add this line
      ],
      env: {
        production: {
          plugins: ['react-native-paper/babel'],
        },
      },
    };
  };