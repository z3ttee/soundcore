
export type IndexSchema = Class<any>;
export type AccessorDecorator = (target: { constructor: Function } & object, propertyKey: string, descriptor: PropertyDescriptor) => void;
export type Class<T> = { new(): T ;};
