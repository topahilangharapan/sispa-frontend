# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_LOCAL_URL
ENV VITE_API_LOCAL_URL=$VITE_API_LOCAL_URL
RUN npm run build

# Stage 2: Serve with Node.js (Directly on localhost)
FROM node:20-alpine

WORKDIR /app
COPY --from=build /app/dist /app

# Install a simple static server (e.g., serve package)
RUN npm install -g serve

EXPOSE 8081
CMD ["serve", "-s", "/app", "-l", "8081"]

