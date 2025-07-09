Project Plan: https://docs.google.com/document/d/169iJXYR7K577yLJ_Y7lLZuw0CzT_xaY1rsSp18JIcpA/edit?usp=sharing

Wireframes: https://drive.google.com/file/d/1FyKvU3DOxkgPq8OdsOVWELTh4LR4OAgK/view?usp=sharing

Features

- [ ] UI
  - [ ] Interactive UI for picking the ingredients
  - [ ] Loading state for when data is fetching
  - [ ] Different pages:
    - [ ] Home Page
    - [ ] Fridge page: pick ingredients after logging in
    - [ ] Recipe page: after picking ingredients
    - [ ] Profile page: only after logging in
- [ ] Recipe Generation
  - [ ] Generated Recipe based on selected ingredients
  - [ ] Spoonacular API to fetch recipes
  - [ ] Display detailed recipe information (title, cook time, servings, etc)
  - [ ] Click the recipe more details will come up (instructions, ingredients, etc)
  - [ ] If there are no recipes available with only those selected ingredients, recipe generated are those that they can make if they had 1 more ingredient (unsure?)
- [ ] Filters
  - [ ] Based on cook time
  - [ ] Based on serving size
  - [ ] Based on dietary restrictions (vegetarian, gluten-free, etc)
  - [ ] Based on nutrition information (calories, carbs, protein, etc)
- [ ] User System
  - [ ] User register and login with Express Sessions
  - [ ] Secure routes so Fridge and Profile pages are only accessible after login
- [ ] Save Recipes
  - [ ] Able to save recipes
  - [ ] Saved recipes are displayed on the profile page

- [ ] Like Recipes
  - [ ] Able to like recipes
  - [ ] Like recipes are used for personalization (stretch feature)

Stretch Goals

- [ ] Personalized Recommendation
  - [ ] Future recipes generated are influenced by recipes users have liked
  - [ ] Look at ingredients overlap, cuisines[], dishTypes[], recipe tags, cooking time to see if there is a pattern

- [ ] Near-Match Recipes
  - [ ] Shows recipes that the users are missing 1 or 2 ingredient to

- [ ] Dietary Restrictions Information
  - [ ] Save this information to the user's profile (ex vegetarian, gluten-free)
  - [ ] Makes sure all the recipes generated automatically has this dietary restriction followed
