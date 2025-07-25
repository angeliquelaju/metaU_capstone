Project Plan: https://docs.google.com/document/d/169iJXYR7K577yLJ_Y7lLZuw0CzT_xaY1rsSp18JIcpA/edit?usp=sharing

Wireframes: https://drive.google.com/file/d/1FyKvU3DOxkgPq8OdsOVWELTh4LR4OAgK/view?usp=sharing

Name: Find Me Recipes (FER)

Deployed Site: https://metau-capstone.onrender.com

Features

- [x] UI
  - [x] Interactive UI for picking the ingredients
  - [x] Loading state for when data is fetching
  - [x] Different pages:
    - [x] Home Page
    - [x] Fridge page: pick ingredients after logging in
    - [x] Recipe page: after picking ingredients
    - [x] Recs page: personalized recipes based on liked recipes
    - [x] Meal Planner page: if the logged in user has a meal plan, a calendar view will appear, if not it'll be a form that allows them to create a meal plan
    - [x] Grocery List page: generates a grocery list based on the created meal plan
    - [x] Profile page: shows saved recipes, top 5 suggested users and button to click to see recommended recipes based on suggested suers
- [x] Recipe Generation
  - [x] Generated Recipes that has the selected ingredients
  - [x] Spoonacular API to fetch recipes
  - [x] Display detailed recipe information (title, etc)
  - [x] Click the recipe more details will come up (instructions, ingredients, etc)
- [x] Filters
  - [x] Based on cook time
  - [x] Based on nutrition information (calories, carbs, protein, etc)
- [x] User System
  - [x] User register and login with Express Sessions
- [x] Save Recipes
  - [x] Able to save recipes
  - [x] Saved recipes are displayed on the profile page
- [x] Like Recipes
  - [x] Able to like recipes
  - [x] Like recipes are used for personalization in Recs page

Technical Challenges:
- [x] Grocery List
  - [x] Generates a grocery list based on the meal plan the users have build
  - [x] Arranged by aisle (example. produce, canned food, etc)
  - [x] Meal Planner
    - [x] Users can build a meal plan based on the recipes they have saved
    - [x] Auto adjust feature if the users enter too much or too little recipe servings to match the number of meals they want
    - [x] If there is a meal plan, it will be displayed in a calendar-like view (1 week), if not it will default to the meal plan form
- [x] User Suggestion Algorithm
  - [x] Uses weighted jaccard (for comparing recipes) and normal jaccard similarity (for comparing ingredients used in those saved/liked recipes) to calculate a similarity score between users
    - [x] Displays top 5 users who have the highest similarity score to the current user
    - [x] From those 5 users, recommend recipes the current user has not interacted with (liked/saved) and display a match score
      - use cosine similarity to find their similarity score then multiply that score by the interaction that user had for that recipe

Stretch Goals

- [x] Personalized Recommendation
  - [x] Future recipes generated are influenced by recipes users have liked
  - [x] Look at ingredients overlap then generate more recipes from those
- [x] Reducing/Increasing meal servings for adjusting meal plan recipe servings based on macros
- [x] Deploying
    - backend + database: railway
    - frontend: render
- [x] Unit Tests 
