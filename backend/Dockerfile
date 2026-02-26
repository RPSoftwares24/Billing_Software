FROM python:3.10
WORKDIR /app
COPY requirements.txt .
<<<<<<< HEAD
RUN pip install -r requirements.txt
COPY . .
=======
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt
COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
>>>>>>> fd95c044a6f66e210addec5d5221ab3584d4702f
