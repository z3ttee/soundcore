
class DebugImpl {

    public isDebug: boolean = process.env.DEBUG == "true";

}

const Debug = new DebugImpl();
Object.freeze(Debug);

export default Debug;