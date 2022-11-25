
export interface Pagination {
    /**
     * URL that points to the detailed tracks endpoint.
     * Endpoint should be the one which actually returns the
     * metadata of tracks.
     */
    url: string;

    /**
     * Page size
     */
    pageSize?: number;
}