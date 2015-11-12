#CSCC09
##Melody Leung and Jason Liw

Docker (on mathlab) :
---------------------
```
docker -i public -x js/lib,docs -u -o public/docs -I
```

Node.js:
-------
Setup:
```
make build
```

Run in background:
```
make start
```

Stop:
```
make stop
```

Submit Instructions:
-------------------

```
tar cvzf a2.tgz a2_docs.txt readme.txt app/public/ app/node_modules app/config.js app/app.js app/routes/splat.js
submit -c cscc09f15 -a a2 a2.tgz
```
Note you can resubmit by using the -f flag; see man submit on mathlab.utsc for details on usage.


