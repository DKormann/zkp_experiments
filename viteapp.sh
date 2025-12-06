#!/bin/bash
if [ -z "$1" ]
then
    echo "Please provide a name for the app"
    exit 1
fi

echo "creating vite ts app " "$1"

git clone https://github.com/DKormann/zkp_experiments.git

mv zkp_experiments "$1"

cd "$1"

rm -rf .git

find . -type f -exec sh -c "LC_CTYPE=C sed -i '' \"s/zkp_experiments/$1/g\" {}" \;

npm install .

git init .

echo "live development: npm run dev"
echo "to build run: npm run build"
