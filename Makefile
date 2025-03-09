SERVER_IP=52.69.164.172

.PHONY: ssh
ssh:
	ssh -i ~/.ssh/id_ed25519 ubuntu@${SERVER_IP}

.PHONY: download-access-log
download-access-log:
	scp -r -i ~/.ssh/id_ed25519 ubuntu@${SERVER_IP}:/logs/access-log ./logs/prod/

.PHONY: upload-nginxconf
upload-nginxconf:
	scp -r -i ~/.ssh/id_ed25519 ./conf/nginx/nginx.conf ubuntu@${SERVER_IP}:/etc/nginx/nginx.conf
	scp -r -i ~/.ssh/id_ed25519 ./conf/nginx/share ubuntu@${SERVER_IP}:/etc/nginx/

.PHONY: upload-scripts
upload-scripts:
	scp -r -i ~/.ssh/id_ed25519 ./scripts/* ubuntu@${SERVER_IP}:/scripts

.PHONY: upload-makefile
upload-makefile:
	scp -r -i ~/.ssh/id_ed25519 ./Makefile ubuntu@${SERVER_IP}:/var/www/araya.dev/

.PHONY: deploy-all
deploy-all:
	rsync --exclude "**/node_modules" --delete -r -e "ssh -i ~/.ssh/id_ed25519" ./ ubuntu@${SERVER_IP}:/var/www/araya.dev/

.PHONY: deploy-www
deploy-www:
	rsync --delete -r -e "ssh -i ~/.ssh/id_ed25519" ./www.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/www.araya.dev/

.PHONY: deploy-pg
deploy-pg:
	rsync --delete -r -e "ssh -i ~/.ssh/id_ed25519" ./playground.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/playground.araya.dev/

.PHONY: deploy-myip
deploy-myip:
	rsync --delete -r -e "ssh -i ~/.ssh/id_ed25519" ./myip.araya.dev/myip-araya-dev ubuntu@${SERVER_IP}:/var/www/araya.dev/myip.araya.dev/

.PHONY: dev-blog
blog-dev:
	cd blog.araya.dev && yarn run watch &
	sudo h2o -c conf/h2o/local/blog.conf

.PHONY: build-blog
blog-build: 
	cd blog.araya.dev && yarn run build && cd ..

.PHONY: deploy-blog 
deploy-blog:
	rsync --delete -r -e "ssh -i ~/.ssh/id_ed25519" ./blog.araya.dev/dist/ ubuntu@${SERVER_IP}:/var/www/araya.dev/blog.araya.dev/dist

.PHONY: deploy-nevertls
deploy-nevertls:
	rsync --delete -r -e "ssh -i ~/.ssh/id_ed25519" ./nevertls.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/nevertls.araya.dev/

.PHONY: start-dev
start-dev:
	docker-compose build && docker-compose up -d

.PHONY: start-prod
start-prod:
	sudo nginx

.PHONY: restart-prod
restart-prod:
	sudo nginx -s reload

.PHONY: certificate
certificate:
	sudo certbot certonly \
	--expand \
	--webroot \
	--webroot-path /var/www/araya.dev/www.araya.dev/ \
	-d araya.dev \
	-d playground.araya.dev \
	-d blog.araya.dev \
	--agree-tos \
	--non-interactive \
	--cert-name araya.dev

.PHONY: build-boringssl
build-boringssl:
	docker build -f Dockerfile.boringssl -t boringssl-builder .
	docker run --rm -v ${PWD}/lib/boringssl:/etc/boringssl boringssl-builder /scripts/build-boringssl

