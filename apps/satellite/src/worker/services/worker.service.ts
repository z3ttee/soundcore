import { Injectable } from "@nestjs/common";
import workerpool from "workerpool";

@Injectable()
export class WorkerService {

    private readonly _pool = workerpool.pool();

}