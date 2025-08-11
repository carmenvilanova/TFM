# web/project/Dockerfile
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Declare the build argument
ARG REACT_APP_API_URL
# Pass the argument to the build command
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# Build the application with the environment variable
RUN npm run build

# --- Servidor NGINX ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]