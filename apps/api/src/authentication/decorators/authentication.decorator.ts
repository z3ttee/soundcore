import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Retrieve the authenticated user's data.
 */
export const Authentication = createParamDecorator((data: never, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
