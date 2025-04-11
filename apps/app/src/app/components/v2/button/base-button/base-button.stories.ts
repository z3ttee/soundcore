import { StoryObj, argsToTemplate, type Meta } from "@storybook/angular";
import { NGS_DEFAULT_SHAPE } from "../../../constants";
import { buildBoolControl, buildSelectControl } from "../../../stories/utils/storyUtils";
import { alignNames, colorNames, shapeNames, variantNames } from "../../../types/general";
import { NGSBaseButtonComponent } from "./base-button.component";

const meta: Meta<NGSBaseButtonComponent> = {
  title: "Components/Buttons/Base",
  component: NGSBaseButtonComponent,
  tags: ["autodocs"],
  argTypes: {
    disabled: buildBoolControl(),
    color: buildSelectControl(colorNames),
    shape: buildSelectControl(shapeNames),
    variant: buildSelectControl(variantNames),
    alignment: buildSelectControl(alignNames)
  },
  render: ((args: NGSBaseButtonComponent) => ({
    props: {
      ...args,
      click: () => {
        console.log("hello world");
      }
    },
    template: `
    <ngs-base-button ${argsToTemplate(args)}>Click me!</ngs-base-button>
    <ngs-base-button class="mt-sm w-full" ${argsToTemplate(args)}>Click me!</ngs-base-button>
    `
  })) as any
};

export default meta;
type Story = StoryObj<NGSBaseButtonComponent>;

const defaultArgs: Story["args"] = {
  color: null,
  shape: NGS_DEFAULT_SHAPE,
  variant: "contained",
  disabled: false,
  alignment: "center"
};

export const Primary: Story = {
  args: defaultArgs
};
