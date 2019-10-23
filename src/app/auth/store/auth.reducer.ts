import {User} from '../user.model';
import * as AuthActions from './auth.actions';
import {Action, createReducer, on} from '@ngrx/store';

export interface State {
  user: User;
  authError: string;
  loading: boolean;
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false
};

export function authReducer(authState: State | undefined, authAction: Action) {
  return createReducer(
    initialState,
    on(AuthActions.loginStart, AuthActions.signupStart, state => ({
      ...state,
      authError: null,
      loading: true
    })),
    on(AuthActions.authenticateSuccess, (state, action) => ({
      ...state,
      authError: null,
      user: new User(action.email, action.userId, action.token, action.expirationDate)
    })),
    on(AuthActions.authenticateFail, (state, action) => ({
      ...state,
      user: null,
      authError: action.errorMessage,
      loading: false
    })),
    on(AuthActions.logout, state => ({
      ...state,
      user: null
    })),
    on(AuthActions.authenticateStopLoading, state => ({
      ...state,
      loading: false
    })),
  )(authState, authAction);
}
