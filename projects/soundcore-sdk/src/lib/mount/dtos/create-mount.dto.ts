
export class CreateMountDTO {
    public name: string;
    public directory: string;
    public bucketId: string;

    public doScan?: boolean = true;
    public setAsDefault?: boolean = false;
}