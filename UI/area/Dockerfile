FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create public directory for APK
RUN mkdir -p /app/public/apk

# Expose port 8081
EXPOSE 8081

# Start development server on port 8081
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8081"]
