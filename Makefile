.PHONY: ssh
ssh:
	ssh -i ~/.ssh/araya.dev.pem ubuntu@52.193.125.60
sync-all:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./ ubuntu@52.193.125.60:/var/www/araya.dev/
sync-www:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./www.araya.dev/ ubuntu@52.193.125.60:/var/www/araya.dev/www.araya.dev/
sync-blog:
	rsync --delete -r -e "ssh -i ~/.ssh/araya.dev.pem" ./blog.araya.dev/_site/ ubuntu@52.193.125.60:/var/www/araya.dev/blog.araya.dev/
start:
	sudo h2o -c ./h2o.conf
daemon:
	sudo h2o -m daemon -c ./h2o.conf
restart:
	sudo kill -TERM `cat /logs/pid-file` && make daemon
