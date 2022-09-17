import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import Button, { ButtonProps } from "./Button";

export default {
    title: "Components/Button",
    component: Button
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args: ButtonProps) => <>
    <div className="flex flex-wrap gap-1 items-baseline bg-body p-window">
        <Button {...args} disabled>Disabled</Button>
        <Button {...args} variant="contained"></Button>
        <Button {...args} variant="outlined"></Button>
        <Button {...args} variant="text"></Button>
        <Button {...args} className="w-full" align="center" />
        <Button {...args} size="sm">SM size</Button>
        <br/>
        <Button {...args}>MD size</Button>
        <br/>
        <Button {...args} size="lg">LG size</Button>
    </div>
</>;

export const Primary = Template.bind({});
Primary.args = {
    children: <>Hello World</>
}