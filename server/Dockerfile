# Use Node.js LTS (slim for smaller image size)
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the API port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
