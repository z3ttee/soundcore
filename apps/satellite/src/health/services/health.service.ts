import { Inject, Injectable } from "@nestjs/common";
import { ZONE_HOSTNAME } from "../../constants";

@Injectable()
export class HealthService {

    constructor(
        @Inject(ZONE_HOSTNAME) private readonly hostname: string
    ) {}

}