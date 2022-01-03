#!/bin/bash

NGINX_VERSION=1.21.5
sudo add-apt-repository -y ppa:longsleep/golang-backports
sudo apt update

sudo apt install -y \
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
	make \
	golang

sudo mkdir -p /var/logs
mkdir -p /etc/nginx

cd /etc/nginx

wget "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" && \
	tar -xzvf nginx-${NGINX_VERSION}.tar.gz

git clone https://github.com/openresty/headers-more-nginx-module.git

cd /etc/nginx/nginx-${NGINX_VERSION}

./configure --prefix=/etc/nginx --conf-path=/etc/nginx/nginx.conf --add-dynamic-module=/etc/nginx/headers-more-nginx-module --with-http_ssl_module --with-http_v2_module

make modules
cp objs/ngx_http_headers_more_filter_module.so /etc/nginx/modules/

sudo make && sudo make install

echo "export PATH=/etc/nginx/sbin:$PATH" >> .zshrc
source ~/.zshrc

# Build BoringSSL
cd /etc
git clone https://boringssl.googlesource.com/boringssl
cd boringssl
mkdir -p build
cd build
cmake ..
make



