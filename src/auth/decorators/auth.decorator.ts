import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../interfaces/valid-roles";
import { AuthGuard } from "@nestjs/passport";
import { UseRoleGuard } from "../guards/use-role.guards";
import { RoleProtected } from "./role-protected.decorator";


export function Auth(...roles: ValidRoles[]){
    return applyDecorators(
        RoleProtected( ...roles ),
        UseGuards( AuthGuard(), UseRoleGuard ),
    )
}