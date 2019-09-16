import {EventEmitter, Injectable} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  ingredientsChanged = new EventEmitter<Ingredient[]>();

  private ingredients: Ingredient[] = [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10)
  ];

  getIngredients() {
    return this.ingredients.slice();
  }

  addIngredient(ingredient: Ingredient) {
    this.ingredients.push(ingredient);
    this.ingredientsChanged.emit(this.getIngredients());
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
    this.ingredientsChanged.emit(this.getIngredients());
  }
}
