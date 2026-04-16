import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CapabilityService } from '../services/capability/capability.service';

export const capabilityGuard: CanActivateFn = (route) => {
  const capabilityService = inject(CapabilityService);
  const router            = inject(Router);
  const required          = route.data['capability'] as string | undefined;

  if (!required || capabilityService.hasCapability(required)) {
    return true;
  }

  return router.createUrlTree(['/app/dash']);
};