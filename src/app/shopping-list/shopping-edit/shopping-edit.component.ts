import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f', {static: false}) shoppingListForm: NgForm;
  sub: Subscription;
  editMode = false;
  editedNumberIndex: number;
  editedItem: Ingredient;

  constructor(private shoppingListService: ShoppingListService) {
  }

  ngOnInit() {
    this.sub = this.shoppingListService.startedEditing.subscribe((index: number) => {
      this.editedNumberIndex = index;
      this.editMode = true;
      this.editedItem = this.shoppingListService.getIngredient(index);
      this.shoppingListForm.setValue({
        name: this.editedItem.name,
        amount: this.editedItem.amount
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onSubmit(form: NgForm) {
    const newIngredient = new Ingredient(form.value.name, form.value.amount);
    if (this.editMode) {
      this.shoppingListService.updateIngredient(this.editedNumberIndex, newIngredient);
    } else {
      this.shoppingListService.addIngredient(newIngredient);
    }
    this.clearForm();
  }

  onDelete() {
    this.shoppingListService.deleteIngredient(this.editedNumberIndex);
    this.clearForm();
  }

  clearForm() {
    this.editMode = false;
    this.shoppingListForm.reset();
  }
}
