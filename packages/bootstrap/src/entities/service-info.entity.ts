export class ServiceInfo {
  public readonly client_id!: string;
  public readonly client_name!: string;
  public readonly client_version!: string;
  public readonly client_secret?: string;

  constructor(client_id: string, client_name: string, client_version: string, client_secret?: string) {
    this.client_id = client_id;
    this.client_name = client_name;
    this.client_version = client_version;
    this.client_secret = client_secret;
  }
}

export const DefaultServiceInfo = new ServiceInfo(
  "service_client_id",
  "service_client_name",
  "service_version",
  "service_client_secret"
);
