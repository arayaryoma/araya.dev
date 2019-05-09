SERVER_IP=52.69.164.172
.PHONY: ssh
ssh:
	ssh -i ~/.ssh/araya.dev.pem ubuntu@${SERVER_IP}
upload-h2oconf:
	scp -i ~/.ssh/araya.dev.pem ./h2o.conf ubuntu@${SERVER_IP}:/var/www/araya.dev/
sync-all:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./ ubuntu@${SERVER_IP}:/var/www/araya.dev/
sync-www:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./www.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/www.araya.dev/
sync-pg:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./playground.araya.dev/ ubuntu@${SERVER_IP}:/var/www/araya.dev/playground.araya.dev/
sync-blog:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./blog.araya.dev/dist/ ubuntu@${SERVER_IP}:/var/www/araya.dev/blog.araya.dev/dist
start:
	sudo h2o -c ./h2o.conf
daemon:
	sudo h2o -m daemon -c ./h2o.conf
restart:
	sudo kill -TERM `cat /logs/pid-file` && make daemon
