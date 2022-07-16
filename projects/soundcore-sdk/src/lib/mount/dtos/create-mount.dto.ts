
export class CreateMountDTO {
    public name: string;
    public bucketId: string;
    
    public directory?: string;
    public doScan?: boolean = true;
    public setAsDefault?: boolean = false;
}