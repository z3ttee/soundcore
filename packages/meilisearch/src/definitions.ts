
export type IndexSchema = Function;
export type AccessorDecorator = (target: { constructor: Function } & object, propertyKey: string, descriptor: PropertyDescriptor) => void;
