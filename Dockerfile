FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Serve same page for /404
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/404.html \
 && cp /usr/share/nginx/html/index.html /usr/share/nginx/html/404