SERVER_IP=52.69.164.172
.PHONY: ssh
ssh:
	ssh -i ~/.ssh/id_rsa ubuntu@${SERVER_IP}
.PHONY: download-access-log
download-access-log:
	scp -r -i ~/.ssh/id_rsa ubuntu@${SERVER_IP}:/logs/access-log ./logs/prod/
.PHONY: upload-h2oconf
upload-h2oconf:
	scp -r -i ~/.ssh/id_rsa ./h2o.conf ./conf ubuntu@${SERVER_IP}:/var/www/araya.dev/
upload-makefile:
	scp -r -i ~/.ssh/id_rsa ./Makefile ubuntu@${SERVER_IP}:/var/www/araya.dev/
.PHONY: sync-all
sync-all:
	rsync --exclude "**/node_modules" --delete -r -e "ssh -i ~/.ssh/id_rsa" ./ ubuntu@${SERVER_IP}:/var/www/araya.dev/
.PHONY: sync-www
sync-www:
	rsync --delete -r -e "ssh -i ~/.ssh/id_rsa" ./www.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/www.araya.dev/
.PHONY: sync-pg
sync-pg:
	rsync --delete -r -e "ssh -i ~/.ssh/id_rsa" ./playground.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/playground.araya.dev/
.PHONY: sync-blog
sync-blog:
	rsync --delete -r -e "ssh -i ~/.ssh/id_rsa" ./blog.araya.dev/dist/ ubuntu@${SERVER_IP}:/var/www/araya.dev/blog.araya.dev/dist
.PHONY: sync-nevertls
sync-nevertls:
	rsync --delete -r -e "ssh -i ~/.ssh/id_rsa" ./nevertls.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/nevertls.araya.dev/
.PHONY: start
start:
	sudo h2o -c ./h2o.conf
.PHONY: daemon
daemon:
	sudo h2o -m daemon -c ./h2o.conf
.PHONY: restart
restart:
	sudo kill -TERM `cat /logs/pid-file` && make daemon

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
