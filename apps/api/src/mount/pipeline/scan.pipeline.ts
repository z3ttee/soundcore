import { runner, StageExecutor } from "@soundcore/worker";

const executor: StageExecutor = async (stage, env) => {
    return runner().step("123", async (step, logger) => {
        logger.info("Das ist ein Test");
        logger.warn("Das ist eine Warnung");
        logger.error(new Error("Ein Error ist aufgetreten."));

        step.progress(0.3);
        step.write("success", true);
        step.progress(1.0);
        step.message("Message: Hello World!");
    }).build()
}

export default executor;