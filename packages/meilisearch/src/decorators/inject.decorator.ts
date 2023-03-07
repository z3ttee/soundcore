import { Inject } from "@nestjs/common";
import { IndexSchema } from "../definitions";
import { getSchemaToken } from "../utils/asyncProvider";

export function InjectIndex(schema: IndexSchema): ReturnType<typeof Inject> {
    return Inject(getSchemaToken(schema));
}