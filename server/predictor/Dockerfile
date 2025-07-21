# predictor/Dockerfile

FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpython3-dev \
    python3-pip \
    libatlas-base-dev \
    libopenblas-dev \
    liblapack-dev \
    gfortran \
    git \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy app files
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Run the app
CMD ["python", "app.py"]
