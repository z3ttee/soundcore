import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class Bucket implements SCDKResource {
    public resourceType: SCDKResourceType;

    public id: string;
    public machineId: string;
    public name: string;

    public mountsCount?: number;

}