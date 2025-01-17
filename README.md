# Prediction Calibration App

This app allows you to improve your precision in making probablistic estimates what will happen in the future. You make predictions noting level of confidence in your prediction. Then you gather statistics over predictions see where your world model deviates from reality and try to improve your score. This is rationality exercise described in book "Why Some People See Things Clearly and Others Don't" by Julia Galef. Abridged description is provided in Help section of this App.

# Features

- Bank of 100 random science questions
- Allows to make predictions and store their resolve date and probability
- Statistics over answered training questions and predictions
- Also you can review which questions/predictions you answered correctly and where you've been mistaken
- Supports multiple users
- Client-server architecture with REST API and Web-interface - you can access running app from any browser on any device in your local net
- Integration tests for backend with pytest
- Only Russian language right now, sorry :)

# Interface

![pic1](pictures_for_readme/pic1.png)
![pic2](pictures_for_readme/pic2.png)
![pic3](pictures_for_readme/pic3.png)
![pic4](pictures_for_readme/pic4.png)
![pic5](pictures_for_readme/pic5.png)
![pic6](pictures_for_readme/pic6.png)

# Requirements:
docker-compose 18
Docker 18

# Running
docker-compose up
docker-compose exec server python recreate_db.py

By default app is available on port 3000, you can change that by changing MAIN_PORT env variable or by specifying it in .env file

# TODOs

- Page for adding questions online
- Loading questions from more files
- Selecting topic for exercise questions
- Good error alerts when answering questions from multiple browsers or when Promises are rejected instead of just changing title for page
- Fix blinking "Loading..." - preload some data
- English translation (maybe)
