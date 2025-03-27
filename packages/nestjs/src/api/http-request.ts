import { PageFilter } from "@repo/utilities";
import { Request as ExpressRequest } from "express";

export type Request = ExpressRequest & {
  headers: {
    [key: string]: string | undefined | null;
    authorization: string | undefined | null;
  };
  params: {
    [key: string]: string | undefined | null;
  };
  query: PageFilter & {
    [key: string]: string | undefined | null;
    offset?: string;
    limit?: string;
  };
};
