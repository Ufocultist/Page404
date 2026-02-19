FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/404