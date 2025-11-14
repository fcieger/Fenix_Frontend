#!/bin/bash
# Helper script to analyze git diff and create commit message

FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: $0 <file>"
  exit 1
fi

# Get diff
DIFF=$(git diff "$FILE")

# Extract context (last 2 folders before file)
if [[ "$FILE" == */* ]]; then
  dir_path=$(dirname "$FILE")
  IFS='/' read -ra ADDR <<< "$dir_path"
  len=${#ADDR[@]}
  if [ $len -ge 2 ]; then
    context="${ADDR[$len-2]}/${ADDR[$len-1]}"
  elif [ $len -eq 1 ]; then
    context="${ADDR[0]}"
  else
    context=""
  fi
else
  context=""
fi

# Get filename without extension
filename=$(basename "$FILE")
filename_no_ext="${filename%.*}"

# Analyze diff to determine type and description
if echo "$DIFF" | grep -qE "^\+.*(function|const|export|import|interface|type|class)" | head -1; then
  type="feat"
  desc="added functionality"
elif echo "$DIFF" | grep -qE "^\-.*(function|const|export|import|interface|type|class)" | head -1; then
  type="refactor"
  desc="removed code"
elif echo "$DIFF" | grep -qE "(fix|bug|error|exception)"; then
  type="fix"
  desc="fixed issues"
elif echo "$DIFF" | grep -qE "(refactor|cleanup|optimize)"; then
  type="refactor"
  desc="refactored code"
elif echo "$DIFF" | grep -qE "^\+.*(doc|readme|comment|todo)"; then
  type="docs"
  desc="updated documentation"
elif echo "$DIFF" | grep -qE "^\+[[:space:]]*$|^-[[:space:]]*$"; then
  type="chore"
  desc="formatting changes"
else
  type="chore"
  desc="updated code"
fi

# Count significant changes (non-whitespace)
additions=$(echo "$DIFF" | grep -cE "^\+[^+]" || echo "0")
deletions=$(echo "$DIFF" | grep -cE "^-[^-]" || echo "0")

# Refine description based on changes
if [ "$additions" -gt 10 ] && [ "$deletions" -lt 5 ]; then
  desc="added features"
elif [ "$deletions" -gt 10 ] && [ "$additions" -lt 5 ]; then
  desc="removed code"
elif [ "$additions" -gt 5 ] && [ "$deletions" -gt 5 ]; then
  desc="updated implementation"
fi

# Create commit message
if [ -z "$context" ]; then
  commit_msg="${type}: ${desc} in ${filename_no_ext}"
else
  commit_msg="${type}(${context}): ${desc} in ${filename_no_ext}"
fi

echo "$commit_msg"

