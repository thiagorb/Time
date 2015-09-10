#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd`
SCRIPTNAME=`basename "${BASH_SOURCE[0]}"`

cd "$SCRIPTDIR"

if [ "$1" == "--ts" ]
then
    echo `date` Building TypeScript files...
    tsc --target ES5 *.ts
fi

if [ "$1" == "--less" ]
then
    echo `date` Building LESS files...
     lessc app.less -o app.css
fi

if [ -z $1 ]
then
    entr "$SCRIPTDIR/$SCRIPTNAME" --ts <<< "`ls -1 *.ts`" & entr "$SCRIPTDIR/$SCRIPTNAME" --less <<< "`ls -1 *.less`" &
fi
