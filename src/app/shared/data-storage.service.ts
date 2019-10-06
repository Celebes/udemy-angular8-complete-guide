import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RecipeService} from '../recipes/recipe.service';
import {Recipe} from '../recipes/recipe.model';
import {map} from 'rxjs/operators';
import {tap} from 'rxjs/internal/operators/tap';

/*
 * ink do realtime database (test mode) projektu firebase z domyslnymi ustawieniami
 */
const BACKEND_URL = 'https://xyz.firebaseio.com/';

@Injectable({providedIn: 'root'})
export class DataStorageService {

  constructor(private http: HttpClient,
              private recipeService: RecipeService) {
  }

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    // put w przypadku firebase podmienia aktualna wartosc pod podanym endpointem na to co przekazemy, zamiast dodawac
    this.http.put(`${BACKEND_URL}/recipes.json`, recipes)
      .subscribe(response => console.log(response));
  }

  fetchRecipes() {
    return this.http.get<Recipe[]>(`${BACKEND_URL}/recipes.json`)
      .pipe(
        map(recipes => recipes.map(recipe => {
          // obsluga przepisow stworzonych bez ingredients,
          // ktore wtedy po stronie firebase nie maja w ogole takiego pola,
          // wiec trzeba dodac chociaz pusta tablice
          return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
        })),
        tap(recipes => this.recipeService.setRecipes(recipes))
      );
  }
}
