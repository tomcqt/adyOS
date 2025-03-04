#!/bin/bash

# Total steps (approximate based on how git outputs progress updates)
TOTAL_STEPS=100
CURRENT_STEP=0

# Get current branch
BRANCH=$(git branch --show-current)

# Function to draw a progress bar
draw_progress() {
    local progress=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    local bar_length=$((progress / 2))  # Adjust for visual size (50 chars)
    local bar=$(printf "%-${bar_length}s" "#" | tr ' ' '#')
    printf "\r[%-50s] %3d%%" "$bar" "$progress"
}

# Run git pull and process progress output
git pull --progress origin $BRANCH 2>&1 | while read -r line; do
    if [[ "$line" =~ (Receiving objects|Resolving deltas) ]]; then
        ((CURRENT_STEP += 5))  # Increment progress (tweak this for better accuracy)
        draw_progress
    fi
done

# Ensure progress bar reaches 100%
CURRENT_STEP=$TOTAL_STEPS
draw_progress
echo -e "\nUpdated!"