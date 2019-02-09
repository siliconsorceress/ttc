# Use an official Python runtime as a base image
FROM python:3.7.1-slim

# Set the working directory to /app
WORKDIR /ttc

# Copy the current directory contents into the container at /app
ADD src /ttc

# Install any needed packages specified in requirements.txt
RUN apt-get update &&\
apt-get dist-upgrade -y &&\
pip install pipenv &&\
pipenv install --deploy --system

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run app.py when the container launches
CMD ["python", "ttc.py"]

