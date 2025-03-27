import { ServiceInfo } from "../entities/service-info.entity";
import { readServiceInfoSync } from "./readServiceInfo";

export interface LogoOptions {
  /**
   * Logo data which is printed.
   * When using buffer, it should be in ASCII encoding
   */
  logoData?: string | Buffer;
  /**
   * Name of the platform to be displayed
   * inside service info
   */
  platformName?: string;
}

/**
 * Print branding to stdout
 * @param options Options to configure the branding
 */
export function printLogo(options?: LogoOptions): void {
  const { logoData, platformName } = options ?? {};

  const year = new Date().getFullYear();

  let service_info: ServiceInfo;
  try {
    service_info = readServiceInfoSync();
  } catch (e) {
    return;
  }

  let logo = `
     .-+*#%@@@@@@@%#+=:     
  *#.@@@@@@@@@@@@@@@@@@.#*
@@@%.@@%#+==@@@@%=+#@@@++@@@
@@@@.       @@@@#      .%@@@      ____                      __
#@@@#-.     @@@@#      =@@@%     /\  _\`\                   /\ \__
  @@@@@@#*- @@@@#      -*%@*     \ \ \L\ \    ___     ___  \ \  _\
    *#%@@@# @@@@%-@@@#*+=-.       \ \  _ <'  / __\`\  / __\`\ \ \ \/
           #@@@@%:#%@@@@@@%        \ \ \L\ \/\ \L\ \/\ \L\ \ \ \ \_
 .@@@@      @@@@%    :@@@@:         \ \____/\ \____/\ \____/  \ \__\
  :@@@#     %@@@%   .@@@@:           \/___/  \/___/  \/___/    \/__/
   -@@@@*-  %@@@% :+@@@@:   
    .*@@@@# %@@@%-@@@@+     
      :*%@# %@@@%-@@+.      
           :#@@@*.:         
`;

  if (typeof logoData === "string") {
    logo = logoData;
  } else if (Buffer.isBuffer(logoData)) {
    logo = logoData.toString("ascii");
  }

  let platform = "TS";
  if (typeof platformName === "string") {
    platform = platformName;
  }

  console.log(`
${logo}
  
© ${year} ${platform} | All rights reserved

ID:         ${service_info.client_id}
Service:    ${service_info.client_name}
Version:    ${service_info.client_version}
`);
}
