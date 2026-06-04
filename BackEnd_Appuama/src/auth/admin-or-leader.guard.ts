import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common"
import { Observable } from "rxjs"

@Injectable()
export class AdminOrLeaderGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user;
    console.log('AdminOrLeaderGuard: User object received:', user);
    console.log(`AdminOrLeaderGuard: Raw posicaoEquipe: '${user?.posicaoEquipe}', Length: ${user?.posicaoEquipe?.length}`);

    if (!user) {
      throw new ForbiddenException("Apenas administradores e líderes podem acessar esta rota.");
    }

    const isLeader = user.posicaoEquipe?.trim().toLowerCase() === 'lider';

    if (!user.isAdmin && !isLeader) {
      console.log('AdminOrLeaderGuard: Forbidden condition met for user (after robust check):', user);
      throw new ForbiddenException("Apenas administradores e líderes podem acessar esta rota.")
    }

    return true;
  }
}
