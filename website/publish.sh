#:/bin/sh

rm -r ../docs
rm -r .parcel-cache
yarn build || exit
touch ../docs/.nojekyll

ls -l ../docs
