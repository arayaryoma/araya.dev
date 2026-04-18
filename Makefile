SHELL := /bin/bash

SERVER_IP ?= 52.69.164.172
SSH_USER ?= ubuntu
SSH_KEY_PATH ?= /tmp/araya_dev_id_ed25519
OP_PRIVATE_KEY_REF ?= op://Private/default/private key

REMOTE_ROOT ?= /var/www/araya.dev
LOCAL_ROOT ?= .
RSYNC_FLAGS ?= --delete -r
RSYNC_COMMON := rsync ${RSYNC_FLAGS} -e "ssh -i ${SSH_KEY_PATH}"

LOG_DIR ?= ./logs/prod

.DEFAULT_GOAL := help

.PHONY: help
help:
	@printf "\nUsage: make <target> [VAR=value]\n\n"
	@printf "Common variables:\n"
	@printf "  SERVER_IP=%s\n" "${SERVER_IP}"
	@printf "  SSH_USER=%s\n" "${SSH_USER}"
	@printf "  SSH_KEY_PATH=%s\n\n" "${SSH_KEY_PATH}"
	@printf "Targets:\n"
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z0-9_.-]+:.*## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: ssh
ssh: sshkey ## Connect to the production server via SSH
	ssh -i ${SSH_KEY_PATH} ${SSH_USER}@${SERVER_IP}

.PHONY: sshkey
sshkey: ## Load the private key from 1Password into a temporary file
	@command -v op >/dev/null || (echo "1Password CLI (op) is required." && exit 1)
	@test -n "${OP_PRIVATE_KEY_REF}" || (echo "Set OP_PRIVATE_KEY_REF=op://<vault>/<item>/<field>" && exit 1)
	@op read "${OP_PRIVATE_KEY_REF}" > ${SSH_KEY_PATH}
	@chmod 600 ${SSH_KEY_PATH}

.PHONY: download-access-log
download-access-log: sshkey ## Download access logs to ./logs/prod
	mkdir -p ${LOG_DIR}
	scp -r -i ${SSH_KEY_PATH} ${SSH_USER}@${SERVER_IP}:/logs/access-log ${LOG_DIR}/

.PHONY: upload-nginxconf
upload-nginxconf: sshkey ## Upload nginx.conf and include files to the server
	scp -r -i ${SSH_KEY_PATH} ./conf/nginx/nginx.conf ${SSH_USER}@${SERVER_IP}:/etc/nginx/nginx.conf
	scp -r -i ${SSH_KEY_PATH} ./conf/nginx/share ${SSH_USER}@${SERVER_IP}:/etc/nginx/

.PHONY: upload-scripts
upload-scripts: sshkey ## Upload scripts directory contents to /scripts
	scp -r -i ${SSH_KEY_PATH} ./scripts/* ${SSH_USER}@${SERVER_IP}:/scripts

.PHONY: upload-makefile
upload-makefile: sshkey ## Upload Makefile to the server repository
	scp -r -i ${SSH_KEY_PATH} ./Makefile ${SSH_USER}@${SERVER_IP}:${REMOTE_ROOT}/

.PHONY: deploy-all
deploy-all: sshkey ## Deploy the full repository (excluding node_modules)
	${RSYNC_COMMON} --exclude "**/node_modules" ${LOCAL_ROOT}/ ${SSH_USER}@${SERVER_IP}:${REMOTE_ROOT}/

.PHONY: deploy-www
deploy-www: sshkey ## Deploy www.araya.dev
	${RSYNC_COMMON} ./www.araya.dev/ ${SSH_USER}@${SERVER_IP}:${REMOTE_ROOT}/www.araya.dev/

.PHONY: deploy-pg
deploy-pg: sshkey ## Deploy playground.araya.dev
	${RSYNC_COMMON} ./playground.araya.dev/ ${SSH_USER}@${SERVER_IP}:${REMOTE_ROOT}/playground.araya.dev/

.PHONY: deploy-myip
deploy-myip: sshkey ## Deploy myip.araya.dev
	${RSYNC_COMMON} ./myip.araya.dev/myip-araya-dev ${SSH_USER}@${SERVER_IP}:${REMOTE_ROOT}/myip.araya.dev/

.PHONY: blog-dev
blog-dev: ## Start the blog watch server
	cd blog.araya.dev && yarn run watch &
	sudo h2o -c conf/h2o/local/blog.conf

.PHONY: blog-build
blog-build: ## Build blog content
	cd blog.araya.dev && yarn run build && cd ..

.PHONY: deploy-blog
deploy-blog: sshkey ## Deploy blog dist output
	${RSYNC_COMMON} ./blog.araya.dev/dist/ ${SSH_USER}@${SERVER_IP}:${REMOTE_ROOT}/blog.araya.dev/dist

.PHONY: deploy-nevertls
deploy-nevertls: sshkey ## Deploy nevertls.araya.dev
	${RSYNC_COMMON} ./nevertls.araya.dev/ ${SSH_USER}@${SERVER_IP}:${REMOTE_ROOT}/nevertls.araya.dev/

.PHONY: start-dev
start-dev: ## Start development Docker containers
	docker-compose build && docker-compose up -d

.PHONY: start-prod
start-prod: ## Start production nginx
	sudo nginx

.PHONY: restart-prod
restart-prod: ## Reload production nginx
	sudo nginx -s reload

.PHONY: certificate
certificate: ## Issue/renew araya.dev certificates with certbot
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
build-boringssl: ## Build BoringSSL artifacts via Docker image
	docker build -f Dockerfile.boringssl -t boringssl-builder .
	docker run --rm -v ${PWD}/lib/boringssl:/etc/boringssl boringssl-builder /scripts/build-boringssl
