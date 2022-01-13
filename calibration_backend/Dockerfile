FROM python:3.10

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# TODO: move db to persistence layer and init it here
#RUN python recreate_db.py

CMD [ "python", "calibration_backend.py" ]

