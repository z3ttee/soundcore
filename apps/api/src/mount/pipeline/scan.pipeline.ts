import { runner, StageExecutor } from "@soundcore/worker";

const executor: StageExecutor = async (env, emit) => {
    return runner().step("123", async (step) => {
        console.log(`executing step ${step.id}`);
        step.outputs = { success: true };

        emit("hello-world", { emitted: true })
    }).build()
}

export default executor;