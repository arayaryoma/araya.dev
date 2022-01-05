#!/bin/bash

apt update

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
	make \
	mercurial

mkdir -p /var/logs
mkdir -p /etc/nginx

# Build Nginx with BoringSSL
cd /etc/nginx

hg clone -b quic https://hg.nginx.org/nginx-quic
git clone --depth 1 https://github.com/openresty/headers-more-nginx-module.git
git clone --depth 1 https://github.com/google/ngx_brotli.git
cd ngx_brotli
git submodule update --init

cd /etc/nginx/nginx-quic

./auto/configure --prefix=/etc/nginx \
--conf-path=/etc/nginx/nginx.conf \
--add-dynamic-module=/etc/nginx/headers-more-nginx-module \
--add-dynamic-module=/etc/nginx/ngx_brotli \
--with-http_ssl_module \
--with-http_v2_module \
--with-debug --with-http_v3_module \
--with-cc-opt="-I../boringssl/include" \
--with-ld-opt="-L../boringssl/build/ssl -L../boringssl/build/crypto"

make modules
cp objs/*.so /etc/nginx/modules/

make && make install

# echo "export PATH=/etc/nginx/sbin:$PATH" >> .zshrc
# source ~/.zshrc
cp /etc/nginx/sbin/nginx /usr/local/sbin