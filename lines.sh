#!/bin/bash

# awesome lines.sh file generates the thing like uh
# Contains #.#k+ lines of code!
echo "Contains $(git ls-files | xargs wc -l | awk '{total += $1} END {rounded = int((total + 500)/500)*500; printf "%.1fk+", rounded/1000}') lines of code!"
