# Build stage
FROM docker-registry.x5.ru/node:22-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm set registry "https://art.x5.ru/artifactory/api/npm/npm" && \
    npm install
COPY . .
RUN npm run build

# Production stage
FROM docker-registry.x5.ru/nginx:1.29.1-alpine3.22 as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
