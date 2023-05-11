
export function isUndefined(target: any): target is undefined {
    return typeof target === "undefined";
}

export function isNull(target: any): target is null | undefined {
    return isUndefined(target) || target == null;
}

export function isString(target: any): boolean {
    return !isNull(target) && typeof target === "string";
}

export function pascalToSnakeCase(input: string): string {
    return input?.split(/\.?(?=[A-Z])/)?.join('_')?.toLowerCase();
}

export function hasProperty<T = any>(propertyKey: keyof T, obj: T): boolean {
    return !isUndefined(obj[propertyKey]);
}