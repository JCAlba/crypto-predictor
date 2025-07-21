# Use a lightweight official Node.js image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port your Node.js app listens on
EXPOSE 4000

# Command to run the server
CMD ["node", "index.js"]
