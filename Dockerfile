FROM node:lts-alpine3.19

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

# Build the application
RUN npm run build:prod

# Setup database if needed
RUN if [ "$DATABASE_SETUP" = "true" ]; then npm run db:setup; fi

# Start the production server
CMD ["npm", "run", "start:prod"]