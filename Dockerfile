# Scanner driver
FROM docker-registry.x5.ru/maven:3.9.11-amazoncorretto-8-debian-trixie as deb-stage

COPY driver /scanner
WORKDIR /scanner

RUN mvn clean package
RUN makedeb.sh

# Web app build stage
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
COPY --from=deb-stage /tmp/deviceservice.deb /tmp/deviceservice.deb

RUN dpkg -i /tmp/deviceservice.deb
RUN cat /usr/share/Mindeo/deviceservice/deviceservice.log

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
