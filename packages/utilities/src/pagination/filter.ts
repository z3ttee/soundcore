export type PageSort<TData = string> = Record<TData extends object ? keyof TData : string, "ASC" | "DESC">;
export type PageFilter = {
  [key: string | number | symbol]: any | null | undefined;
};
