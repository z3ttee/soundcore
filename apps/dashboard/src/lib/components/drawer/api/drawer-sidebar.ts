import { Directive, TemplateRef, viewChild } from "@angular/core";

@Directive()
export abstract class ScDrawerSidebarBase {
    /** The content of the sidebar to be rendered in the sidebar slot */
    public readonly content = viewChild(TemplateRef);
}