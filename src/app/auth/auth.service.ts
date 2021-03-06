import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Injectable({providedIn: 'root'})
export class AuthService {
  private tokenExpirationTimer;

  constructor(private store: Store<AppState>) {
  }

  setLogoutTimer(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => this.store.dispatch(AuthActions.logout()), expirationDuration);
  }

  clearLogoutTimer() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
}
