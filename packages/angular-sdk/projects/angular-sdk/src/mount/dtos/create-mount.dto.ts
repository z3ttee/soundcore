
export class CreateMountDTO {
    public name: string;
    public zone: { id: string };
    public directory?: string;
    public doScan?: boolean = true;
    public isDefault?: boolean = false;
}