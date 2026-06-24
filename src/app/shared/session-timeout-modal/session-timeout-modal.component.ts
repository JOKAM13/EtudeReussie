import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InactivityTimeoutService } from '../../core/inactivity-timeout.service';

@Component({
  selector: 'app-session-timeout-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeout-overlay" *ngIf="timeoutService.timeoutMessage$ | async as message">
      <div class="timeout-card">
        <div class="timeout-icon">🔒</div>

        <h2>Session expirée</h2>

        <p>
          {{ message }}
        </p>

        <button type="button" (click)="timeoutService.closePopupAndRedirect()">
          Se reconnecter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .timeout-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(15, 23, 42, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .timeout-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 24px;
      padding: 32px 28px;
      text-align: center;
      box-shadow: 0 25px 80px rgba(15, 23, 42, 0.35);
      animation: popupFadeIn 0.25s ease-out;
    }

    .timeout-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 18px;
      border-radius: 50%;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }

    p {
      margin: 0 0 24px;
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
    }

    button {
      width: 100%;
      border: none;
      border-radius: 14px;
      padding: 14px 20px;
      background: #2563eb;
      color: white;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
    }

    button:hover {
      background: #1d4ed8;
    }

    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class SessionTimeoutModalComponent {
  constructor(public readonly timeoutService: InactivityTimeoutService) {}
}