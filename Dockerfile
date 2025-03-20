# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_LOCAL_URL
ENV VITE_API_LOCAL_URL=$VITE_API_LOCAL_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25.3-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
