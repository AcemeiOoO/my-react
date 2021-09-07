module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    // 在 js 文件里写 jsx
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    // 可以写 ++ 自增
    'no-plusplus': ['off', {
      allowForLoopAfterthoughts: true,
    }],
    // 可以使用 ... 展开符
    'react/jsx-props-no-spreading': 'off',
    // 取消不交互的元素无法使用事件
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    // 换行符问题
    'linebreak-style': ['off', 'windows'],
  },
};
