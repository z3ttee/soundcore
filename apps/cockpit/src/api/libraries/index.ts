import { API_ENDPOINT } from "../constants";

export type Library = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
};

export function getLibraries(pageIndex: number = 0, pageSize: number = 30) {
  const params = new URLSearchParams({
    pageIndex: pageIndex.toString(),
    pageSize: pageSize.toString(),
  });

  return fetch(`${API_ENDPOINT}/v1/libraries?${params.toString()}`, {});
}
