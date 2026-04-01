# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build the Vite application for production
RUN npm run build

# Production Serving Stage
FROM nginx:alpine
# Copy built assets to Nginx default document root
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default Nginx configuration to support React Router (SPA fallback)
RUN rm /etc/nginx/conf.d/default.conf
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
