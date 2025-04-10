import { Directive, TemplateRef, viewChild } from "@angular/core";

@Directive()
export abstract class ScDrawerContentBase {
    /** The content of the drawer content to be rendered */
    public readonly content = viewChild(TemplateRef);
}