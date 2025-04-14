# Base image
FROM node:16

# Set build argument (build-time)
ARG VITE_API_LOCAL_URL

# Working directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build aplikasi dengan env variable
RUN npm run build

# Expose port
EXPOSE 8081

# Jalankan aplikasi
CMD ["npm", "run", "serve", "--", "--port", "8081"]
