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
browse to http://localhost:8000
```
Fixing permission (for mathlab):
--------------------------------
```
sh permission.sh
```
