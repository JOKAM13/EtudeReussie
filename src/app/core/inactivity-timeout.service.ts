import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_STORAGE_KEY = 'etude-reussie-token';
const USER_STORAGE_KEY = 'etude-reussie-user';

const CURRENT_USER_KEY = 'etude-reussie-current-user-id';
const IMPERSONATOR_USER_KEY = 'etude-reussie-impersonator-user-id';
const IMPERSONATION_RETURN_URL_KEY = 'etude-reussie-impersonation-return-url';

const INACTIVITY_MESSAGE_KEY = 'etude-reussie-logout-message';

@Injectable({
  providedIn: 'root'
})
export class InactivityTimeoutService {
  private readonly timeoutDuration = 60 * 1000; // 1 minute
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

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
    this.zone.runOutsideAngular(() => {
      this.activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, () => this.resetTimer(), true);
      });
    });

    this.resetTimer();
  }

  start(): void {
    this.resetTimer();
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private resetTimer(): void {
    if (!this.isUserLoggedIn()) {
      this.stop();
      return;
    }

    this.stop();

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
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(IMPERSONATOR_USER_KEY);
    sessionStorage.removeItem(IMPERSONATION_RETURN_URL_KEY);

    sessionStorage.setItem(
      INACTIVITY_MESSAGE_KEY,
      'Vous avez été déconnecté après 1 heure d’inactivité.'
    );

    alert('Vous avez été déconnecté après 1 heure d’inactivité.');

    this.router.navigate(['/login']);
  }
}