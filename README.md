#CSCC09
##Melody Leung and Jason Liw

Docker (on mathlab) :
---------------------
```
docker -i public -x js/lib,docs -u -o public/docs -I
```
Running webserver:
------------------
```
python -m SimpleHTTPServer
```
browse to http://0.0.0.0:8000/public


Fixing permission (for mathlab):
--------------------------------
```
sh permission.sh
```
browse to https://mathlab.utsc.utoronto.ca/courses/cscc09f15/_UTORID_/_PATH_TO_PUBLIC_
