import os from "node:os";
import path from "node:path";
import { Environment } from "../environment";

export class Files {
  /**
   * Get absolute path to the app's directory. The directory should contain
   * all files that are created by the app during runtime.
   * @returns Absolute path
   */
  public static getDataDirectory(): string {
    return Environment.isDockerized ? path.resolve("/data") : path.join(this.getUserDirectory(), ".hr-cloud");
  }

  /**
   * Get absolute path to the service's directory. The directory should contain
   * all files that are created by the service during runtime.
   * @returns Absolute path
   */
  public static getServiceDirectory(): string {
    return Environment.isDockerized
      ? this.getDataDirectory()
      : path.join(this.getDataDirectory(), Environment.client_id.toLowerCase());
  }

  /**
   * Get absolute path to the current user's directory.
   * @see https://nodejs.org/api/os.html#oshomedir
   * @returns Absolute path to user's home directory
   */
  public static getUserDirectory(): string {
    return os.homedir();
  }
}
