import { SCDKResource, SCDKResourceType } from "../../utils/entities/resource";

export class Distributor implements SCDKResource {
    public resourceType: SCDKResourceType;
    public name: string;
    public id: string;
}