import axios from 'axios';
import { key, proxy } from '../config';

export default class Recipe{

  constructor(id){
    this.id = id;
  }

  async getRecipe(){
    try{
      const res = await axios(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    }catch(error){
      console.log(error);
      alert("Something went wrong.");
    }
  }

  calcTime(){
    // Assuming that we need 15 min for each 3 ingredients.
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng/3);
    this.time = periods * 15;
  }

  calcServings(){
    this.servings = 4; // Just for presentation.
  }

  parseIngredients(){

    const unitsLong = ['tablespoons', 'tablespoons', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
    const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
    const units = [...unitShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map(el => {
      // 1. Uniform units.
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitShort[i]);
      });

      // 2. Remove parentheses.
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

      // 3. Parse Ingredients into count, unit and ingredient.
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

      let objIng;
      if(unitIndex > -1){
        // There is a unit.

        // Ex: 4 1/2 cups, arrCount is [4, 1/2]
        // Ex: 4 cups, arrCount is [4]
        const arrCount = arrIng.slice(0, unitIndex);
        let count;
        if(arrCount.length === 1){
          count = eval(arrIng[0].replace('-', '+'));
        }else{
          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }

        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        };

      }else if( parseInt(arrIng[0, 10]) ){ // if first position is not a number this will return NaN and therefore the condition is false.
        // There is no unit, but 1st element is a number. (Ex: 1 Pizza)
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        };
      }else if(unitIndex === -1){
        // There is no unit and no number in the 1st position. (Ex: pizza)
        objIng = {
          count: 1,
          unit: '',
          ingredient
        };
      }

      return objIng;

    });

    this.ingredients = newIngredients;
  }
}