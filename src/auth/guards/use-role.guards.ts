import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ValidRoles } from '../interfaces/valid-roles';
import { META_ROLES } from "../decorators/role-protected.decorator";
import { User } from "../entities/auth.entity";


@Injectable()
export class UseRoleGuard implements CanActivate{


    constructor(
        private readonly reflector: Reflector
    ){}

    
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {

        const ValidRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());

        if (!ValidRoles) return true;

        if (ValidRoles.length === 0) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user as User;

        for(const role of user.role.name){
            if( ValidRoles.includes( role as ValidRoles ) ){
                return true;
            }

        }

        throw new ForbiddenException('User does not have the required roles');
    }
}