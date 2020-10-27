SERVER_IP=52.69.164.172
.PHONY: ssh
ssh:
	ssh -i ~/.ssh/araya.dev.pem ubuntu@${SERVER_IP}
.PHONY: upload-h2oconf
upload-h2oconf:
	scp -r -i ~/.ssh/araya.dev.pem ./h2o.conf ./conf ubuntu@${SERVER_IP}:/var/www/araya.dev/
upload-makefile:
	scp -r -i ~/.ssh/araya.dev.pem ./Makefile ubuntu@${SERVER_IP}:/var/www/araya.dev/
.PHONY: sync-all
sync-all:
	rsync --exclude "**/node_modules" --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./ ubuntu@${SERVER_IP}:/var/www/araya.dev/
.PHONY: sync-www
sync-www:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./www.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/www.araya.dev/
.PHONY: sync-pg
sync-pg:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./playground.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/playground.araya.dev/
.PHONY: sync-blog
sync-blog:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./blog.araya.dev/dist/ ubuntu@${SERVER_IP}:/var/www/araya.dev/blog.araya.dev/dist
.PHONY: sync-nevertls
sync-nevertls:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./nevertls.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/nevertls.araya.dev/
.PHONY: start
start:
	sudo h2o -c ./h2o.conf
.PHONY: daemon
daemon:
	sudo h2o -m daemon -c ./h2o.conf
.PHONY: restart
restart:
	sudo kill -TERM `cat /logs/pid-file` && make daemon
