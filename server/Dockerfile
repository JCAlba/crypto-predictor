# server/Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Optional: Ensure node_modules is separate for caching
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "index.js"]
