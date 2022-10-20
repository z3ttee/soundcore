
class EnvironmentImpl {

    public isDebug: boolean = process.env.DEBUG == "true";
    public isDockerized: boolean = process.env.IS_DOCKERIZED == "true";

}

const Environment = new EnvironmentImpl();
Object.freeze(Environment);

export default Environment;