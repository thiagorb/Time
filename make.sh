#!/bin/bash
SCRIPTPATH=$( sed -r -e "s/\\\/\//g" <<< ${BASH_SOURCE[0]} )
PROJECTDIR=$(cd "$(dirname $SCRIPTPATH)"; pwd)

cd "$PROJECTDIR/Time"

tsc --target ES5 *.ts

if [ ! -e dist ]; then mkdir dist; fi

for js in $(ls -1 *.js)
do
    yui $js > dist/$js
done

for less in $(ls -1 *.less)
do
    css=`sed -r "s/.less$/.css/" <<< "$less"`;
    lessc $less > $css
    yui $css > dist/$css
done

for html in $(ls -1 *.html)
do
    cp $html dist/$html
done

tar -czf dist.tar.gz dist
echo dist.tar.gz created. Size: `du -b dist.tar.gz | cut -f1` bytes

if [ "$1" == "--deploy" ]
then
    if [ "$(git status --porcelain)" ] && [ "$2" != "--force" ]
    then
        echo There are uncommited changes, not deploying.
        exit
    fi
    cp dist.tar.gz /var/tmp
    cd "$PROJECTDIR"
    git branch -d gh-pages
    git push origin :gh-pages
    git checkout --orphan gh-pages
    git reset --hard
    git clean -df
    tar -xf /var/tmp/dist.tar.gz --strip-components 1
    git add -A 
    git commit -m "Dist"
    git push -u origin gh-pages
    git checkout master
    git reset --hard
    git clean -df
fi
