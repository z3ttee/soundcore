
class EnvironmentImpl {
    public isProduction: boolean = process?.env?.PRODUCTION == "true";
    public isDebug: boolean = process?.env?.DEBUG == "true";
    public isDockerized: boolean = process?.env?.DOCKERIZED == "true";
}

const Environment = new EnvironmentImpl();
Object.freeze(Environment);

export default Environment;