# Implementation Plan

- [x] 1. README.mdを新規作成し、プロジェクト概要・技術スタック・前提条件を記載する
  - プロジェクトルートに README.md を作成し、プロジェクト名と概要説明を冒頭に記載する
  - 使用技術スタック（Docker Compose, Vite, Wordmove, GitHub Actions）をリスト形式で記載する
  - 環境構築に必要な前提条件（Docker, Node.js, SSH鍵）を明示する
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. 初期セットアップ手順を順序付きリストで記載する
  - リポジトリのクローンから環境起動までのステップを番号付き手順として記載する
  - `.env.example` を `.env` にコピーし、必要な値を設定する手順を含める
  - `npm install` による依存パッケージのインストール手順を含める
  - `docker compose up -d` によるWordPress環境の起動手順と、アクセスURL（`http://localhost:8080`）を記載する
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. 開発ワークフローとリモート同期の手順を記載する
  - `npm run dev`（Vite watchモード）の起動手順と、SCSSおよびTypeScriptの変更がテーマへ即時反映される動作を説明する
  - `npm run build`（本番ビルド）の実行手順を記載する
  - Wordmove設定済みの場合の `npm run pull:db` および `npm run pull:uploads` によるリモート同期手順を記載する
  - Wordmove使用時の前提条件（SSH鍵設定、.env への接続情報記入、Docker起動済み）を補足する
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. ディレクトリ構成をツリー形式で記載する
  - プロジェクトルートの主要ディレクトリ・ファイルをコードブロック内のツリー形式で記載する
  - 各ディレクトリ（src/, wordpress/）および設定ファイル（docker-compose.yml, vite.config.ts, Movefile.yml, package.json, .env）の役割を簡潔に説明する
  - _Requirements: 4.1, 4.2_

- [x] 5. デプロイ手順と環境変数リファレンスを記載する
  - GitHub Actionsによる自動デプロイの仕組み（mainブランチへのpushがトリガー、ビルド後にrsyncで転送）を説明する
  - GitHub Secretsに設定が必要な変数名（SSH_PRIVATE_KEY, SSH_HOST, SSH_USER, REMOTE_THEME_PATH）をテーブル形式で記載する
  - `.env` ファイルの全変数をカテゴリ（Database, Remote Server, Remote SSH）ごとに分類し、変数名・説明・デフォルト値のテーブルで記載する
  - _Requirements: 5.1, 5.2, 6.1, 6.2_

- [x] 6. README全体の整合性を検証する
  - .env.example の全変数（13変数）が環境変数セクションに網羅されていることを確認する
  - package.json の全scripts（dev, build, up, down, pull:db, pull:uploads）がREADME内に記載されていることを確認する
  - ディレクトリ構成が実際のプロジェクト構造と一致していることを確認する
  - コードブロック内のコマンドがコピー＆ペーストで実行可能な形式であることを確認する
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_
