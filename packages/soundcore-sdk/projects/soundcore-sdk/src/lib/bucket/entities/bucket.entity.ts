import { SCDKResource, SCDKResourceFlag, SCDKResourceType } from "../../utils/entities/resource";

export class Bucket implements SCDKResource {
    public id: string;
    public resourceType: SCDKResourceType = "bucket";
    public flag: SCDKResourceFlag;
    public slug: string;
    public name: string;

    public mountsCount?: number;
    public usedSpace?: number;
}