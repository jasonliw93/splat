default: start
build:
	cd app && make build
clean: stop
	cd app && make clean
start:
	cd app && make start
stop:
	cd app && make stop
