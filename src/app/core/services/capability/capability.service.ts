import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CapabilityService {
  private auth = inject(AuthService);

  private capabilities = computed(() => this.auth.currentUser()?.capabilities ?? []);
  private plan         = computed(() => this.auth.currentUser()?.plan_type ?? 'free');

  hasCapability(capability: string): boolean {
    return this.capabilities().includes(capability);
  }

  hasAnyCapability(capabilities: string[]): boolean {
    return capabilities.some(cap => this.hasCapability(cap));
  }

  hasAllCapabilities(capabilities: string[]): boolean {
    return capabilities.every(cap => this.hasCapability(cap));
  }

  hasPlan(plans: Array<'free' | 'plus' | 'premium'>): boolean {
    return plans.includes(this.plan());
  }
}