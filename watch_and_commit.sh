#!/bin/bash

# watch_and_commit.sh
# ファイルの変更を監視して自動で git add & commit を行うスクリプト

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
INTERVAL=5  # 監視間隔（秒）

echo "監視開始: $REPO_DIR"
echo "変更検知間隔: ${INTERVAL}秒"
echo "停止するには Ctrl+C を押してください"
echo "---"

cd "$REPO_DIR" || exit 1

while true; do
    # ステージされていない変更（追跡済み＋未追跡ファイル）があるか確認
    CHANGED=$(git status --porcelain)

    if [ -n "$CHANGED" ]; then
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        CHANGED_FILES=$(git status --porcelain | awk '{print $2}' | tr '\n' ' ')

        echo "[$TIMESTAMP] 変更を検知: $CHANGED_FILES"

        git add -A

        COMMIT_MSG="auto commit: $TIMESTAMP"
        git commit -m "$COMMIT_MSG"

        echo "[$TIMESTAMP] コミット完了: $COMMIT_MSG"
        echo "---"
    fi

    sleep "$INTERVAL"
done
