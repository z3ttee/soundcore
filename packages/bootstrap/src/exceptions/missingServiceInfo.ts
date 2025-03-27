export class MissingServiceInfoFileException extends Error {
  constructor(filepath: string) {
    super(`Failed reading service info file '${filepath}'. Does the service have such a file?`);
  }
}
