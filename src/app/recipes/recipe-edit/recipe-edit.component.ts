import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {RecipeService} from '../recipe.service';
import {Recipe} from '../recipe.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  id: number;
  editMode = false;
  recipeForm: FormGroup;
  recipe: Recipe;

  constructor(private route: ActivatedRoute,
              private recipeService: RecipeService,
              private router: Router) {
  }

  ngOnInit() {
    // nie trzeba recznie tutaj robic unsubscribe w ngOnDestroy, bo Angular sam zarzadza subskrypcjami z Observable, ktorych dostarcza
    this.route.params.subscribe((params: Params) => {
      this.id = +params.id;
      this.editMode = params.id != null; // !!params.id nie zadziala, bo 0 jest falsy (!!0 = false, !!1 = true, !!undefined = false)
      if (this.editMode) {
        this.recipe = this.recipeService.getRecipe(params.id);
      }
      this.initForm();
    });
  }

  private initForm() {
    const recipeName = this.editMode ? this.recipe.name : '';
    const recipeImagePath = this.editMode ? this.recipe.imagePath : '';
    const recipeDescription = this.editMode ? this.recipe.description : '';
    const recipeIngredients = new FormArray([]);

    if (this.editMode && this.recipe.ingredients && this.recipe.ingredients.length > 0) {
      for (const ingredient of this.recipe.ingredients) {
        recipeIngredients.push(this.createRecipeIngredientsFormGroup(ingredient.name, ingredient.amount));
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, [Validators.required]),
      imagePath: new FormControl(recipeImagePath, [Validators.required]),
      description: new FormControl(recipeDescription, [Validators.required]),
      ingredients: recipeIngredients
    });
  }

  getIngredientsFormGroups() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  onAddIngredient() {
    (this.recipeForm.get('ingredients') as FormArray).push(this.createRecipeIngredientsFormGroup());
  }

  createRecipeIngredientsFormGroup(name?: string, amount?: number): FormGroup {
    return new FormGroup({
      name: new FormControl(name, [Validators.required]),
      amount: new FormControl(amount, [
        Validators.required,
        Validators.pattern(/^[1-9]+[0-9]*$/)
      ])
    });
  }

  goBackToDetailsView() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onDeleteIngredient(index: number) {
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  onSubmit() {
    if (this.editMode) {
      this.recipeService.updateRecipe(this.id, this.recipeForm.value);
    } else {
      this.recipeService.addRecipe(this.recipeForm.value);
    }
    this.goBackToDetailsView();
  }
}
