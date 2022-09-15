import Logo, { LogoProps } from "./Logo";
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
    title: "Components/Logo",
    component: Logo
} as ComponentMeta<typeof Logo>;

const Template: ComponentStory<typeof Logo> = (args: LogoProps & any) => <Logo {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    
}
