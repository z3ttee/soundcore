import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import Divider, { DividerProps } from "./Divider";

export default {
    title: "Components/Divider",
    component: Divider
} as ComponentMeta<typeof Divider>;

const Template: ComponentStory<typeof Divider> = (args: DividerProps & any) => <Divider {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    
}