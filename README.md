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
tar cvzf a1.tgz public a1_docs.txt cover.pdf
submit -c cscc09f15 -a a1s1 a1s1.tgz
submit -c cscc09f15 -a a1s2 a1s2.tgz
submit -c cscc09f15 -a a1 a1.tgz
```
Note you can resubmit by using the -f flag; see man submit on mathlab.utsc for details on usage.


