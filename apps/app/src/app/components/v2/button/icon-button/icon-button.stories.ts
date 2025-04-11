import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StoryObj, argsToTemplate, moduleMetadata, type Meta } from "@storybook/angular";
import { Observable } from "rxjs";
import { buildBoolControl, buildSelectControl } from "../../../stories/utils/storyUtils";
import { NGSComponentAction } from "../../../types";
import { colorNames, dimensionNames, shapeNames, variantNames } from "../../../types/general";
import { NGSIconButtonComponent } from "./icon-button.component";

const meta: Meta<NGSIconButtonComponent> = {
  title: "Components/Buttons/IconButton",
  component: NGSIconButtonComponent,
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
    variant: buildSelectControl(variantNames)
  },
  render: ((args: NGSIconButtonComponent) => ({
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
    template: `<ngs-icon-button ${argsToTemplate(args)} (click)="click($event)">i</ngs-icon-button>`
  })) as any
};

export default meta;
type Story = StoryObj<NGSIconButtonComponent>;

const defaultArgs: Story["args"] = {
  size: "md",
  color: "default",
  shape: "circular",
  variant: "contained",
  disabled: false
};

export const Primary: Story = {
  args: defaultArgs
};

export const WithSpinner: Story = {
  args: defaultArgs
};
