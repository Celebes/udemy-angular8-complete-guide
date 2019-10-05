import {Injectable} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  ingredientsChanged = new Subject<Ingredient[]>();
  startedEditing = new Subject<number>();

  private ingredients: Ingredient[] = [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10)
  ];

  getIngredients() {
    return this.ingredients.slice();
  }

  getIngredient(index: number) {
    return this.getIngredients()[index];
  }

  addIngredient(ingredient: Ingredient) {
    this.ingredients.push(ingredient);
    this.ingredientsChanged.next(this.getIngredients());
  }

  addIngredients(newIngredients: Ingredient[]) {
    for (const ni of newIngredients) {
      const index = this.ingredients.findIndex(i => i.name === ni.name);
      if (index >= 0) {
        this.ingredients[index].amount += ni.amount;
      } else {
        /*
        tutaj trzeba stworzyc nowy ingredient na podstawie przekazanego
        w przeciwnym wypadku uzyskamy tylko referencje na skladnik z przepisu
        przez co jego modyfikacja (zwiekszenie amount) bedzie powodowala tez modyfikacje skladniku w przepisie
         */
        this.ingredients.push(new Ingredient(ni.name, ni.amount));
      }
    }
    this.ingredientsChanged.next(this.getIngredients());
  }

  updateIngredient(index: number, newIngredient: Ingredient) {
    this.ingredients[index] = newIngredient;
    this.ingredientsChanged.next(this.getIngredients());
  }

  deleteIngredient(index: number) {
    this.ingredients.splice(index, 1);
    this.ingredientsChanged.next(this.getIngredients());
  }
}
