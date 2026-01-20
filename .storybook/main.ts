import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/Introduction.mdx",
    "../src/stories/docs/**/*.mdx",
    "../src/stories/foundations/**/*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))",
    "../src/stories/components/**/*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))",
    "../src/stories/patterns/**/*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))",
    "../src/stories/screens/**/*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))",
    "../src/stories/wireframes/**/*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))",
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {},
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@": "/src",
        },
      },
    };
  },
};

export default config;
