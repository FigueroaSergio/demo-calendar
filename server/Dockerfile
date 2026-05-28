FROM minizinc/minizinc:edge-alpine

# Install Python3 and pip
RUN apk add --update --no-cache python3 py3-pip

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy application source code and MiniZinc models
COPY main.py .
COPY *.mzn .

# Expose the API port
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
