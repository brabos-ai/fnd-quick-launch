import { Injectable, CanActivate, ExecutionContext, NotFoundException, Inject } from '@nestjs/common';
import { IConfigurationService } from '@fnd/contracts';

/**
 * Guard que verifica se a funcionalidade de workspace está habilitada.
 *
 * Se FEATURES_WORKSPACE_ENABLED=false, retorna 404 (feature desabilitada)
 * Se FEATURES_WORKSPACE_ENABLED=true, permite acesso
 *
 * Use este guard em todos os endpoints do WorkspaceController
 */
@Injectable()
export class WorkspaceFeatureGuard implements CanActivate {
  constructor(@Inject('IConfigurationService') private readonly configService: IConfigurationService) {}

  canActivate(context: ExecutionContext): boolean {
    const featureFlags = this.configService.getFeatureFlags();

    if (!featureFlags.workspaceEnabled) {
      throw new NotFoundException('Workspace feature is not enabled');
    }

    return true;
  }
}
