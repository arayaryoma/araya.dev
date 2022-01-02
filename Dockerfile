ARG NGINX_VERSION=1.21.5
FROM nginx:${NGINX_VERSION}

WORKDIR /etc/nginx/

RUN apt update && \
	apt install -y \
	openssh-client \
	git \
	wget \
	libxml2 \
	libxslt1-dev \
	libpcre3 \
	libpcre3-dev \
	zlib1g \
	zlib1g-dev \
	openssl \
	libssl-dev \
	libtool \
	automake \
	gcc \
	g++ \
	make


RUN wget "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" && \
	tar -xzvf nginx-${NGINX_VERSION}.tar.gz

RUN git clone https://github.com/openresty/headers-more-nginx-module.git

WORKDIR /etc/nginx/nginx-${NGINX_VERSION}

RUN ./configure --prefix=/etc/nginx --conf-path=/etc/nginx/nginx.conf --add-dynamic-module=/etc/nginx/headers-more-nginx-module --with-http_ssl_module --with-http_v2_module


RUN make modules
RUN cp objs/ngx_http_headers_more_filter_module.so /etc/nginx/modules/

RUN  make && make install
ENV PATH="/etc/nginx/sbin:${PATH}"

COPY ./certs/fullchain.pem /etc/tls/certs/fullchain.pem
COPY ./certs/privkey.pem /etc/tls/certs/privkey.pem

COPY conf/nginx/nginx.local.conf /etc/nginx/nginx.conf
ADD conf/nginx/share /etc/nginx/
