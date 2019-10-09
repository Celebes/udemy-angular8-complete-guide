import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {catchError} from 'rxjs/operators';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {User} from './user.model';
import {tap} from 'rxjs/internal/operators/tap';
import {Router} from '@angular/router';

const USER_LOCAL_STORAGE_KEY = 'userData';

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null); // specjalny rodzaj Subject, ktory pozwala na dostanie sie do ostatniej emitowanej wartosci
  private signOutTimeout;

  constructor(private http: HttpClient,
              private router: Router) {
  }

  signUp(email: string, password: string) {
    return this.sendAuthRequest(email, password, AuthType.SIGN_UP);
  }

  signIn(email: string, password: string) {
    return this.sendAuthRequest(email, password, AuthType.SIGN_IN);
  }

  autoSignUp() {
    const userData: string = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (!userData) {
      return;
    }

    const parsedUser = JSON.parse(userData);
    const tokenExpirationDate = new Date(parsedUser._tokenExpirationDate);

    const loadedUser = new User(
      parsedUser.id,
      parsedUser.email,
      parsedUser._token,
      tokenExpirationDate
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const remainingExpirationDuration = tokenExpirationDate.getTime() - new Date().getTime();
      this.autoSignOut(remainingExpirationDuration);
    }
  }

  signOut() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
    if (this.signOutTimeout) {
      clearTimeout(this.signOutTimeout);
    }
    this.signOutTimeout = null;
  }

  autoSignOut(expirationDuration: number) {
    this.signOutTimeout = setTimeout(() => this.signOut(), expirationDuration);
  }

  private sendAuthRequest(email: string, password: string, authType: AuthType): Observable<AuthResponseData> {
    const apiEndpoint = (authType === AuthType.SIGN_UP) ? 'signUp' : 'signInWithPassword';
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:${apiEndpoint}?key=${environment.firebaseAPIKey}`;
    return this.http.post<AuthResponseData>(url, {email, password, returnSecureToken: true})
      .pipe(
        catchError(this.handleError),
        tap(this.handleAuthentication)
      );
  }

  private handleAuthentication = (authResponseData: AuthResponseData) => {
    const expiresInMs = +authResponseData.expiresIn * 1000; // expiresIn = string z waznoscia tokena w sekundach, domyslnie 3600
    const expirationDate = new Date(new Date().getTime() + expiresInMs);
    const user = new User(authResponseData.localId, authResponseData.email, authResponseData.idToken, expirationDate);
    this.user.next(user);
    this.autoSignOut(expiresInMs);
    localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
  };

  private handleError(errorResponse: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured!';

    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(errorMessage);
    }

    switch (errorResponse.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exists!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct!';
        break;
    }

    return throwError(errorMessage);
  }
}

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean; // tylko dla sign in
}

enum AuthType {
  SIGN_UP,
  SIGN_IN
}
