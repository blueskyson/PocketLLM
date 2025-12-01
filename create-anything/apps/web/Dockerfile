FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set API URL for Docker network
ENV VITE_API_URL=http://backend:8080

# Expose port (Vite uses 4000)
EXPOSE 4000

# Run dev server
CMD ["npm", "run", "dev"]