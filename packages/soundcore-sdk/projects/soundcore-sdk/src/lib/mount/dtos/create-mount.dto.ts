
export class CreateMountDTO {
    public name: string;
    public bucket: { id: string };
    public directory?: string;
    public doScan?: boolean = true;
    public isDefault?: boolean = false;
}