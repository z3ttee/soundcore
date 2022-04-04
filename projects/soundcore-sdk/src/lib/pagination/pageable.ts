export class Pageable {
    public size?: number = 30;
    public page?: number = 0;

    public static toQuery(pageable: Pageable): string {
        if(!pageable) pageable = new Pageable();
        if(!pageable.size) pageable.size = 30;
        if(!pageable.page) pageable.page = 0;

        const searchParams = new URLSearchParams();
        searchParams.append("page", `${pageable.page}`);
        searchParams.append("size", `${pageable.size}`);

        return `?${searchParams}`;
    }
}