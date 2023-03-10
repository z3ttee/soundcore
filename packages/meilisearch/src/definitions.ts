
export type IndexSchema = ObjectType<any>;
export type AccessorDecorator = (target: { constructor: Function } & object, propertyKey: string, descriptor: PropertyDescriptor) => void;
export type ObjectType<T> = { new(): T ;} | Function;
export type IndexSchemaResolver = () => IndexSchema;
