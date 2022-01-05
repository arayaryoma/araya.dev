FROM debian:bullseye-slim

WORKDIR /etc/nginx/

COPY ./lib/boringssl /etc/nginx/boringssl
ADD ./scripts/setup-server.sh /scripts/
RUN chmod +x /scripts/setup-server.sh
RUN /scripts/setup-server.sh

COPY ./certs/fullchain.pem /etc/tls/certs/fullchain.pem
COPY ./certs/privkey.pem /etc/tls/certs/privkey.pem

COPY conf/nginx/nginx.local.conf /etc/nginx/nginx.conf
ADD conf/nginx/share /etc/nginx/

EXPOSE 80
EXPOSE 443/udp
EXPOSE 443/tcp

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;" ]