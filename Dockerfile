FROM node:20-alpine AS build

ARG BASE_URL=/
ARG API_URL=/solve

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
ENV VITE_API_URL=$API_URL
RUN npm run build -- --base=$BASE_URL

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
