import type { Preview } from "@storybook/react";
import "../src/styles/globals.css"; // Enforce global tokens

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    nextjs: { appDirectory: true }, // Enable App Router support
    layout: 'centered', // Isolate components
  },
};
export default preview;
