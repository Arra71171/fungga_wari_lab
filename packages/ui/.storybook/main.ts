import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const path = require("path");
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "next/image": path.resolve(__dirname, "./mocks/next-image.tsx"),
          "next/link": path.resolve(__dirname, "./mocks/next-link.tsx"),
        },
      },
      define: {
        ...config.define,
        "process.env": {},
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      },
    };
  },
};
export default config;
