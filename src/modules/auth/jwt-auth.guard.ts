import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => (target: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {

  let metaTarget: object;
  if (descriptor && typeof descriptor === 'object' && Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
    metaTarget = descriptor.value as object;
  } else {
    metaTarget = target;
  }
  Reflect.defineMetadata(ROLES_KEY, roles, metaTarget);
};

interface JwtUser {
  _id?: string;
  sub?: string;
  phone?: string;
  role?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = (await super.canActivate(context)) as boolean;
    if (!can) return false;
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as JwtUser;
    if (!user || typeof user.role !== 'string') throw new ForbiddenException('No user role');
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
    return true;
  }
}
