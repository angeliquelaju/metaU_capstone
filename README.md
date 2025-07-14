Project Plan: https://docs.google.com/document/d/169iJXYR7K577yLJ_Y7lLZuw0CzT_xaY1rsSp18JIcpA/edit?usp=sharing

Wireframes: https://drive.google.com/file/d/1FyKvU3DOxkgPq8OdsOVWELTh4LR4OAgK/view?usp=sharing

Features

- [x] UI
  - [x] Interactive UI for picking the ingredients
  - [x] Loading state for when data is fetching
  - [x] Different pages:
    - [x] Home Page
    - [x] Fridge page: pick ingredients after logging in
    - [x] Recipe page: after picking ingredients
    - [x] Recs page: personalized recipes based on liked recipes
    - [x] Profile page: only after logging in
- [x] Recipe Generation
  - [x] Generated Recipe based on selected ingredients
  - [x] Spoonacular API to fetch recipes
  - [x] Display detailed recipe information (title, etc)
  - [x] Click the recipe more details will come up (instructions, ingredients, etc)
- [x] Filters
  - [x] Based on cook time
  - [x] Based on nutrition information (calories, carbs, protein, etc)
- [x] User System
  - [x] User register and login with Express Sessions
  - [x] Secure routes so Fridge and Profile pages are only accessible after login
- [x] Save Recipes
  - [x] Able to save recipes
  - [x] Saved recipes are displayed on the profile page
- [x] Like Recipes
  - [x] Able to like recipes
  - [x] Like recipes are used for personalization in another page (stretch feature)

Stretch Goals

- [x] Personalized Recommendation
  - [x] Future recipes generated are influenced by recipes users have liked
  - [x] Look at ingredients overlap, cuisines[], dishTypes[], cooking time to see if there is a pattern
    - currently only looks at ingredients overlap (top 5 most frequent)
