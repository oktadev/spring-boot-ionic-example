#!/bin/bash
# Warning: this script has only been tested on macOS Sierra. There's a good chance
# it won't work on other operating systems. If you get it working on another OS,
# please send a pull request with any changes required. Thanks!
set -e

### CloudFoundry CLI utilities
CLOUD_DOMAIN=${DOMAIN:-run.pivotal.io}
CLOUD_TARGET=api.${DOMAIN}

function login(){
    cf api | grep ${CLOUD_TARGET} || cf api ${CLOUD_TARGET} --skip-ssl-validation
    cf apps | grep OK || cf login
}

function app_domain(){
    D=`cf apps | grep $1 | tr -s ' ' | cut -d' ' -f 6 | cut -d, -f1`
    echo $D
}

function deploy_service(){
    N=$1
    D=`app_domain $N`
    JSON='{"uri":"http://'$D'"}'
    cf create-user-provided-service $N -p $JSON
}

### Installation

cd `dirname $0`
r=`pwd`
echo $r

## Reset
cf d -f ionic-server

cf a

# Deploy the server
cd $r/server
mvn clean package
cf push -p target/*jar ionic-server --no-start --random-route
cf set-env ionic-server FORCE_HTTPS true
cf start ionic-server

# Get the URL for the server
serverUri=https://`app_domain ionic-server`

# Deploy the client
cd $r/ionic-beer
npm run clean
# replace the server URL in the client
sed -i -e "s|http://localhost:8080|$serverUri|g" src/providers/beer-service.ts
npm install

# build ios
ionic cordova build ios --prod
# Run on ios
ionic cordova run ios 

# If the above command fails with the following error:
# xcrun: error: unable to find utility "PackageApplication", not a developer tool or in PATH
# See http://stackoverflow.com/a/43363820

# cleanup changed files
sed -i -e "s|$serverUri|http://localhost:8080|g" src/providers/beer-service.ts
rm $r/ionic-beer/src/providers/beer-service.ts-e
