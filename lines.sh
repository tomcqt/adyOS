# awesome lines.sh file generates the thing like uh
# Contains #.#k+ lines of code!
echo "Contains $(echo $(( ( $(git ls-files | xargs wc -l | sort -n | cut -d' ' -f2 | grep "\S") + 500 / 500 ) / 500 * 500 )) / 1000 | bc -l | sed '/\./{s/0\+$//;s/\.$/.0/;b};s/$/.0/')k+ lines of code!"