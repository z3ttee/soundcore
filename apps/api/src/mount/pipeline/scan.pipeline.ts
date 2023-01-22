import { runner, StageExecutor } from "@soundcore/worker";

const executor: StageExecutor = async (stage, env) => {
    return runner().step("123", async (step) => {
        step.progress(0.3);
        step.write("success", true);
        step.progress(1.0);
        step.message("Message: Hello World!");
    }).build()
}

export default executor;