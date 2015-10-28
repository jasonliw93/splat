default: start
build:
	cd app && cp config.js.prod config.js &&\
	ln -s /courses/courses/cscc09f15/rosselet/asn/node_modules node_modules
clean: stop
	cd app && rm node.log config.js node_modules
start:
	cd app && nohup node app.js > node.log 2>&1 & echo SERVER STARTED
stop:
	@foo=`ps xau | sed -e 1d | grep -v grep | \
	grep 'node app.js' | awk '{print $$2}'` ; \
	if test -n "$${foo}" ; then \
	for pid in $${foo} ; do \
	kill $${pid} ; \
	done ; \
	fi
	echo SERVER STOPPED
