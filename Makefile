default: start
build:
	cd app && make build &&\
	ln -s /courses/courses/cscc09f15/rosselet/asn/node_modules node_modules
clean: stop
	cd app && make clean
start:
	cd app && make start
stop:
	@foo=`ps xau | sed -e 1d | grep -v grep | \
	grep 'node app.js' | awk '{print $$2}'` ; \
	if test -n "$${foo}" ; then \
	for pid in $${foo} ; do \
	kill $${pid} ; \
	done ; \
	fi
	echo SERVER STOPPED
