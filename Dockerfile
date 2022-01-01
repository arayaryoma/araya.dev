FROM nginx:latest

COPY ./certs/fullchain.pem /etc/tls/certs/fullchain.pem
COPY ./certs/privkey.pem /etc/tls/certs/privkey.pem

COPY conf/nginx/nginx.local.conf /etc/nginx/nginx.conf
ADD conf/nginx/share /etc/nginx/
