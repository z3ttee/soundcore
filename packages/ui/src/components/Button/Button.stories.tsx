import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import Button, { ButtonProps } from "./Button";

export default {
    title: "Components/Button",
    component: Button
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args: ButtonProps) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    children: <>Hello World</>
}