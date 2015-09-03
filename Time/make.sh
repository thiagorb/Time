#!/bin/sh
SCRIPTPATH=$( sed -r -e "s/\\\/\//g" <<< ${BASH_SOURCE[0]} )
PROJECTDIR=$(dirname $SCRIPTPATH)

cd $PROJECTDIR

if [ ! -e dist ]; then mkdir dist; fi

for js in $(ls -1 *.js)
do
    yui $js > dist/$js
done

for css in $(ls -1 *.css)
do
    yui $css > dist/$css
done

for html in $(ls -1 *.html)
do
    cp $html dist/$html
done

tar -czf dist.tar.gz dist
echo dist.tar.gz created. Size: `du -b dist.tar.gz | cut -f1` bytes