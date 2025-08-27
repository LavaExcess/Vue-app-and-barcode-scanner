# Scanner driver
FROM docker-registry.x5.ru/maven:3.9.11-eclipse-temurin-21-noble AS deb-stage

COPY driver /scanner
WORKDIR /scanner

RUN mvn clean
RUN mvn clean package
RUN sh makedeb.sh

# Web app build stage
FROM docker-registry.x5.ru/node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm set registry "https://art.x5.ru/artifactory/api/npm/npm" && \
    npm install
COPY . .
RUN npm run build

# Production stage
FROM docker-registry.x5.ru/bitnami/nginx:1.29-debian-12 AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=deb-stage /scanner/deviceservice.deb /tmp/deviceservice.deb

USER root
RUN apt update
RUN apt install -y nginx
RUN dpkg -i /tmp/deviceservice.deb
RUN cat /usr/share/Mindeo/deviceservice/deviceservice.log
USER nonroot

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
