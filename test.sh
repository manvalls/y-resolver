#!/bin/bash

rm -rf ./coverage

for file in test/*.js
do
  istanbul cover "$file" --report none --print none --include-pid
done

istanbul report --root ./coverage/ lcovonly text-summary
cat ./coverage/lcov.info | coveralls
rm -rf ./coverage
