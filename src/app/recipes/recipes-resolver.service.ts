import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Recipe} from './recipe.model';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipes.actions';
import * as fromRecipes from '../recipes/store/recipes.reducer';
import {Actions, ofType} from '@ngrx/effects';
import {map, switchMap, take} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';

@Injectable({providedIn: 'root'})
export class RecipesResolverService implements Resolve<Recipe[]> {

  constructor(private store: Store<AppState>, private actions$: Actions) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
    return this.store.select('recipes').pipe(
      take(1),
      map((recipesState: fromRecipes.State) => recipesState.recipes),
      switchMap((recipes: Recipe[]) => {
        if (recipes.length === 0) {
          this.store.dispatch(new RecipesActions.FetchRecipes());
          // mały hack potrzebny z tego wzgledu, ze samo dispatch nie generuje Observable, ktory trzeba zwrocic w Resolverze
          // używamy więc podobnej konstrukcji co w recipes.effects.ts żeby zapiać się na akcje SET_RECIPES
          // bo wtedy wiadomo ze FETCH_RECIPES sie zakonczylo i recipes zostaly zapisane do STORE
          return this.actions$.pipe(
            ofType(RecipesActions.SET_RECIPES),
            take(1) // pobiera wartosc raz (tablice recipes) i konczy Observable
          );
        } else {
          return of(recipes);
        }
      })
    );
  }

}
