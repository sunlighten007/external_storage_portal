FROM node:lts-alpine3.19

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

# Build the application
RUN npm run build:prod

# Start the production server
CMD ["npm", "run", "start:prod"]