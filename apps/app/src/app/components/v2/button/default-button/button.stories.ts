import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StoryObj, argsToTemplate, moduleMetadata, type Meta } from "@storybook/angular";
import { Observable } from "rxjs";
import { NGS_DEFAULT_SHAPE } from "../../../constants";
import { buildBoolControl, buildSelectControl } from "../../../stories/utils/storyUtils";
import { NGSComponentAction } from "../../../types";
import { alignNames, colorNames, dimensionNames, shapeNames, variantNames } from "../../../types/general";
import { NGSButtonComponent } from "./button.component";

const meta: Meta<NGSButtonComponent> = {
  title: "Components/Buttons/Button",
  component: NGSButtonComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule]
    })
  ],
  argTypes: {
    disabled: buildBoolControl(),
    size: buildSelectControl(dimensionNames),
    color: buildSelectControl(colorNames),
    shape: buildSelectControl(shapeNames),
    variant: buildSelectControl(variantNames),
    alignment: buildSelectControl(alignNames)
  },
  render: ((args: NGSButtonComponent) => ({
    props: {
      ...args,
      click: (action: NGSComponentAction) => {
        console.log("hello world");
        action.runUntil(
          new Observable((subscriber) => {
            setTimeout(() => {
              subscriber.next();
              subscriber.complete();
            }, 4000);
          })
        );
      }
    },
    template: `
    <ngs-button ${argsToTemplate(args)} (click)="click($event)">Click me!</ngs-button>
    <ngs-button class="mt-sm w-full" ${argsToTemplate(args)} (click)="click($event)">Click me!</ngs-button>
    `
  })) as any
};

export default meta;
type Story = StoryObj<NGSButtonComponent>;

const defaultArgs: Story["args"] = {
  size: "md",
  color: "default",
  shape: NGS_DEFAULT_SHAPE,
  variant: "contained",
  disabled: false,
  alignment: "center"
};

export const Primary: Story = {
  args: defaultArgs
};

export const WithSpinner: Story = {
  args: defaultArgs
};
