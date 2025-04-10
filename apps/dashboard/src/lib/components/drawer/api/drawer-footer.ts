import { Directive, TemplateRef, viewChild } from "@angular/core";

@Directive()
export abstract class ScDrawerFooterBase {
    /** The content of the footer to be rendered in the siderbar's footer slot */
    public readonly content = viewChild(TemplateRef);
}