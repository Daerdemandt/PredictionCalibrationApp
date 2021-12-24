# Prediction Calibration App

This app allows you to improve your precision in making probablistic estimates what will happen in the future. You make predictions noting level of confidence in your prediction. Then you gather statistics over predictions see where your world model deviates from reality and try to improve your score. This is rationality exercise described in book "Why Some People See Things Clearly and Others Don't" by Julia Galef. Abridged description is provided in Help section of this App.

# Features

- Bank of 100 random science questions
- Statistics over answered training questions
- Also you can review which questions you answered correctly and where you've been mistaken
- Supports multiple users
- Client-server architecture with REST API and Web-interface - you can access running app from any browser on any device in your local net
- Integration tests for backend with pytest
- Only Russian language right now, sorry :)

# Interface

![pic1](pictures_for_readme/pic1.png)
![pic2](pictures_for_readme/pic2.png)
![pic3](pictures_for_readme/pic3.png)
![pic4](pictures_for_readme/pic4.png)

# Requirements

Frontend:

- react 17.0.2
- react-router-dom 6.0.2
- react-scripts 4.0.3
- material-ui 4.12
- axios 0.24.0
- recharts 2.1.8

Backend:

- python 3.10 (actually 3.8 will probably do just fine)
- flask 2.0.2
- flask-SQLAlchemy 2.5.1
- pytest 6.2.5

# Running

Frontend:
```
cd calibration_client
npm start
```

Backend
```
cd calibration_backend
python recreate_db.py  # only first time
python calibration_backend.py
```

# TODOs

- Page for long-term personal predictions
- Page for adding questions online
- Loading questions from more files
- Selecting topic for exercise questions
- Good error alerts when answering questions from multiple browsers or when Promises are rejected
- Fix blinking "Loading..." - preload some data
- English translation (maybe)