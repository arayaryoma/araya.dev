SERVER_IP=52.69.164.172
SSH_KEY_PATH?=/tmp/araya_dev_id_ed25519
OP_PRIVATE_KEY_REF?=op://Private/default/private key

.PHONY: ssh
ssh: sshkey
	ssh -i ${SSH_KEY_PATH} ubuntu@${SERVER_IP}

.PHONY: sshkey
sshkey:
	@command -v op >/dev/null || (echo "1Password CLI (op) is required." && exit 1)
	@test -n "${OP_PRIVATE_KEY_REF}" || (echo "Set OP_PRIVATE_KEY_REF=op://<vault>/<item>/<field>" && exit 1)
	@op read "${OP_PRIVATE_KEY_REF}" > ${SSH_KEY_PATH}
	@chmod 600 ${SSH_KEY_PATH}

.PHONY: download-access-log
download-access-log: sshkey
	scp -r -i ${SSH_KEY_PATH} ubuntu@${SERVER_IP}:/logs/access-log ./logs/prod/

.PHONY: upload-nginxconf
upload-nginxconf: sshkey
	scp -r -i ${SSH_KEY_PATH} ./conf/nginx/nginx.conf ubuntu@${SERVER_IP}:/etc/nginx/nginx.conf
	scp -r -i ${SSH_KEY_PATH} ./conf/nginx/share ubuntu@${SERVER_IP}:/etc/nginx/

.PHONY: upload-scripts
upload-scripts: sshkey
	scp -r -i ${SSH_KEY_PATH} ./scripts/* ubuntu@${SERVER_IP}:/scripts

.PHONY: upload-makefile
upload-makefile: sshkey
	scp -r -i ${SSH_KEY_PATH} ./Makefile ubuntu@${SERVER_IP}:/var/www/araya.dev/

.PHONY: deploy-all
deploy-all: sshkey
	rsync --exclude "**/node_modules" --delete -r -e "ssh -i ${SSH_KEY_PATH}" ./ ubuntu@${SERVER_IP}:/var/www/araya.dev/

.PHONY: deploy-www
deploy-www: sshkey
	rsync --delete -r -e "ssh -i ${SSH_KEY_PATH}" ./www.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/www.araya.dev/

.PHONY: deploy-pg
deploy-pg: sshkey
	rsync --delete -r -e "ssh -i ${SSH_KEY_PATH}" ./playground.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/playground.araya.dev/

.PHONY: deploy-myip
deploy-myip: sshkey
	rsync --delete -r -e "ssh -i ${SSH_KEY_PATH}" ./myip.araya.dev/myip-araya-dev ubuntu@${SERVER_IP}:/var/www/araya.dev/myip.araya.dev/

.PHONY: dev-blog
blog-dev:
	cd blog.araya.dev && yarn run watch &
	sudo h2o -c conf/h2o/local/blog.conf

.PHONY: build-blog
blog-build:
	cd blog.araya.dev && yarn run build && cd ..

.PHONY: deploy-blog
deploy-blog: sshkey
	rsync --delete -r -e "ssh -i ${SSH_KEY_PATH}" ./blog.araya.dev/dist/ ubuntu@${SERVER_IP}:/var/www/araya.dev/blog.araya.dev/dist

.PHONY: deploy-nevertls
deploy-nevertls: sshkey
	rsync --delete -r -e "ssh -i ${SSH_KEY_PATH}" ./nevertls.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/nevertls.araya.dev/

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
