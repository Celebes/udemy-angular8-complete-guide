import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {tap} from 'rxjs/internal/operators/tap';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {User} from '../user.model';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducer';

const USER_LOCAL_STORAGE_KEY = 'userData';

@Injectable() // nigdzie nie bedziemy wstrzykiwac, ale potrzebne zeby wstrzyknac tutaj http itd.
export class AuthEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private authService: AuthService,
              private store: Store<AppState>,
              private router: Router) {
  }

  authSignup$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.signupStart),
    switchMap(action => {
      return this.sendAuthRequest(action.email, action.password, AuthType.SIGN_UP)
        .pipe(
          tap((authResponseData: AuthResponseData) => this.authService.setLogoutTimer(+authResponseData.expiresIn * 1000)),
          map(this.handleAuthentication),
          catchError(this.handleError)
        );
    })
  ));

  authLogin$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginStart),
    switchMap(action => {
      return this.sendAuthRequest(action.email, action.password, AuthType.SIGN_IN)
        .pipe(
          tap((authResponseData: AuthResponseData) => this.authService.setLogoutTimer(+authResponseData.expiresIn * 1000)),
          map(this.handleAuthentication),
          catchError(this.handleError)
        );
    }),
  ));

  authRedirect$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.authenticateSuccess),
    tap(action => {
      if (action.redirect) {
        this.router.navigate(['/']).then(() => this.store.dispatch(AuthActions.authenticateStopLoading()));
      }
    })
  ), {dispatch: false});

  authLogout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
      this.router.navigate(['/auth']);
    })
  ), {dispatch: false});

  authAutoLogin$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.autoLogin),
    map(() => {
      const userData: string = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
      if (!userData) {
        return {type: 'DUMMY'}; // fake action
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
        const expirationDuration = new Date(tokenExpirationDate).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration);

        return AuthActions.authenticateSuccess({
          userId: loadedUser.id,
          email: loadedUser.email,
          token: loadedUser.token,
          expirationDate: tokenExpirationDate,
          redirect: false
        });
      } else {
        return {type: 'DUMMY'}; // fake action
      }
    })
  ));

  private sendAuthRequest(email: string, password: string, authType: AuthType): Observable<AuthResponseData> {
    const apiEndpoint = (authType === AuthType.SIGN_UP) ? 'signUp' : 'signInWithPassword';
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:${apiEndpoint}?key=${environment.firebaseAPIKey}`;
    return this.http.post<AuthResponseData>(url, {email, password, returnSecureToken: true});
  }

  private handleAuthentication = (authResponseData: AuthResponseData) => {
    const expiresInMs = +authResponseData.expiresIn * 1000;
    const expirationDate = new Date(new Date().getTime() + expiresInMs);

    const user = new User(authResponseData.localId, authResponseData.email, authResponseData.idToken, expirationDate);
    localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));

    // tutaj of() nie jest wymagane, bo map automatycznie opakowuje wynik w Observable
    return AuthActions.authenticateSuccess({
      userId: authResponseData.localId,
      email: authResponseData.email,
      token: authResponseData.idToken,
      expirationDate,
      redirect: true
    });
  };

  private handleError = (errorResponse: HttpErrorResponse) => {
    let errorMessage = 'An unknown error occured!';

    if (errorResponse.error && errorResponse.error.error) {
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
    }

    return of(AuthActions.authenticateFail({errorMessage}));
  };
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
