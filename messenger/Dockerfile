# syntax=docker/dockerfile:1
FROM python:3.11
WORKDIR /usr/src/message_app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y netcat-traditional
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY entrypoint.sh .
RUN sed -i 's/\r$//g' /usr/src/message_app/entrypoint.sh
RUN chmod +x /usr/src/message_app/entrypoint.sh
COPY . .
ENTRYPOINT ["/usr/src/message_app/entrypoint.sh"]