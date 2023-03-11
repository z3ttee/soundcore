import { FacetDistribution, Hits, SearchResponse } from "meilisearch";

export class SearchResult<T = any> implements SearchResponse<T> {
    hits: Hits<T>;
    processingTimeMs: number;
    facetDistribution?: FacetDistribution;
    query: string;
    totalHits?: number;
    hitsPerPage?: number;
    page?: number;
    totalPages?: number;
    offset?: number;
    limit?: number;
    estimatedTotalHits?: number;
}