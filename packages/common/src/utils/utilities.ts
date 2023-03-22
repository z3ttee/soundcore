
export function isUndefined(target: any): boolean {
    return typeof target === "undefined";
}

export function isNull(target: any): boolean {
    return isUndefined(target) || target == null;
}

export function pascalToSnakeCase(input: string): string {
    return input?.split(/\.?(?=[A-Z])/)?.join('_')?.toLowerCase();
}