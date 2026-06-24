import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const TOKEN_STORAGE_KEY = 'etude-reussie-token';
const USER_STORAGE_KEY = 'etude-reussie-user';

const CURRENT_USER_KEY = 'etude-reussie-current-user-id';
const IMPERSONATOR_USER_KEY = 'etude-reussie-impersonator-user-id';
const IMPERSONATION_RETURN_URL_KEY = 'etude-reussie-impersonation-return-url';

@Injectable({
  providedIn: 'root'
})
export class InactivityTimeoutService {
  // TEST : 1 minute
  private readonly timeoutDuration = 60 * 60 * 1000;

  // PRODUCTION APRÈS TEST :
  // private readonly timeoutDuration = 60 * 60 * 1000;

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly timeoutMessage$ = new BehaviorSubject<string | null>(null);

  private readonly activityEvents = [
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click'
  ];

  constructor(
    private readonly router: Router,
    private readonly zone: NgZone
  ) {}

  init(): void {
    console.log('[InactivityTimeout] Service initialisé');

    this.zone.runOutsideAngular(() => {
      this.activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, () => this.resetTimer(), true);
      });
    });

    this.resetTimer();
  }

  start(): void {
    console.log('[InactivityTimeout] Minuteur démarré après login');
    this.resetTimer();
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  closePopupAndRedirect(): void {
    this.timeoutMessage$.next(null);
    this.router.navigate(['/login']);
  }

  private resetTimer(): void {
    if (!this.isUserLoggedIn()) {
      this.stop();
      return;
    }

    this.stop();

    console.log('[InactivityTimeout] Timer réinitialisé');

    this.timeoutId = setTimeout(() => {
      this.zone.run(() => {
        this.logoutForInactivity();
      });
    }, this.timeoutDuration);
  }

  private isUserLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private logoutForInactivity(): void {
    console.log('[InactivityTimeout] Déconnexion automatique');

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(IMPERSONATOR_USER_KEY);
    sessionStorage.removeItem(IMPERSONATION_RETURN_URL_KEY);

    this.stop();

    this.timeoutMessage$.next(
      'Votre session a expiré après une période d’inactivité. Veuillez vous reconnecter pour continuer.'
    );
  }
}