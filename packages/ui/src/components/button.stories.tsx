import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
    a11y: { test: "todo" },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "default", size: "default", children: "Save Changes" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /save changes/i });
    await expect(button).toBeInTheDocument();
  },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete Account" },
};

export const Disabled: Story = {
  args: { variant: "default", disabled: true, children: "Processing..." },
};
