FROM node:22-alpine AS build

WORKDIR /src/UI

COPY UI/package.json UI/package-lock.json ./
RUN npm ci

COPY UI/index.html UI/tsconfig.json UI/vite.config.ts ./
COPY UI/public ./public
COPY UI/src ./src

ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.27-alpine AS final

COPY docker/ui.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/UI/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
