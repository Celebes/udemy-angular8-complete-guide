import {Actions, Effect, ofType} from '@ngrx/effects';
import * as RecipesActions from './recipes.actions';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Recipe} from '../recipe.model';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducer';

@Injectable()
export class RecipesEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<AppState>) {
  }

  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() => this.http.get<Recipe[]>(`${environment.firebaseBackendURL}/recipes.json`)),
    map(recipes => recipes.map(recipe => {
      // obsluga przepisow stworzonych bez ingredients,
      // ktore wtedy po stronie firebase nie maja w ogole takiego pola,
      // wiec trzeba dodac chociaz pusta tablice
      return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
    })),
    map(recipes => new RecipesActions.SetRecipes(recipes))
  );

  @Effect({dispatch: false})
  storeRecipes = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([actionData, recipesState]) => { // destrukturyzacja tablicy
      return this.http.put(`${environment.firebaseBackendURL}/recipes.json`, recipesState.recipes);
    })
  );
}
