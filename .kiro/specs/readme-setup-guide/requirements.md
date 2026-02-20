# Requirements Document

## Introduction
本ドキュメントは、WordPress開発テンプレートプロジェクトの環境構築手順をREADMEにまとめるための要件を定義する。新規参加者がリポジトリをクローンしてからローカル開発を開始するまでの全手順を、README.mdとして提供する。

## Project Description (Input)
環境構築手順をREADMEにまとめる

## Requirements

### Requirement 1: README基本構成
**Objective:** As a 新規開発者, I want README.mdでプロジェクトの概要と技術スタックを把握したい, so that プロジェクトの全体像を素早く理解できる

#### Acceptance Criteria
1. The README shall プロジェクト名と1〜2文の概要説明を冒頭に記載する
2. The README shall 使用技術スタック（Docker Compose, Vite, Wordmove, GitHub Actions）を一覧で記載する
3. The README shall 前提条件（Docker, Node.js, SSH鍵など）を明示する

### Requirement 2: 初期セットアップ手順
**Objective:** As a 新規開発者, I want リポジトリのクローンからローカル環境の起動までの手順を知りたい, so that 迷わず環境構築を完了できる

#### Acceptance Criteria
1. The README shall リポジトリのクローンから環境起動までの手順を順序付きリストで記載する
2. The README shall `.env.example`を`.env`にコピーし、必要な値を設定する手順を記載する
3. The README shall `npm install`による依存パッケージのインストール手順を記載する
4. The README shall `docker compose up`によるWordPress環境の起動手順とアクセスURLを記載する

### Requirement 3: 開発ワークフロー手順
**Objective:** As a 開発者, I want 日常の開発コマンド（ビルド、watch、同期など）の使い方を知りたい, so that 効率的に開発作業を行える

#### Acceptance Criteria
1. The README shall `npm run dev`（Vite watchモード）の起動手順と動作説明を記載する
2. The README shall `npm run build`（本番ビルド）の実行手順を記載する
3. Where Wordmoveが設定済みの場合, the README shall `npm run pull:db` および `npm run pull:uploads` によるリモート同期手順を記載する

### Requirement 4: ディレクトリ構成の説明
**Objective:** As a 新規開発者, I want プロジェクトのディレクトリ構成を理解したい, so that ファイルの配置場所と役割を把握できる

#### Acceptance Criteria
1. The README shall プロジェクトルートの主要ディレクトリ・ファイルをツリー形式で記載する
2. The README shall 各ディレクトリ・設定ファイルの役割を簡潔に説明する

### Requirement 5: デプロイ手順の説明
**Objective:** As a 開発者, I want デプロイの仕組みと必要な設定を知りたい, so that GitHub Actionsによる自動デプロイを正しく設定・運用できる

#### Acceptance Criteria
1. The README shall GitHub Actionsによる自動デプロイの仕組み（mainブランチへのpushがトリガー）を記載する
2. The README shall GitHub Secretsに設定が必要な変数名（SSH_PRIVATE_KEY, SSH_HOST, SSH_USER, REMOTE_THEME_PATH）を一覧で記載する

### Requirement 6: 環境変数リファレンス
**Objective:** As a 開発者, I want `.env`ファイルの全変数の意味と設定方法を知りたい, so that 環境設定を正確に行える

#### Acceptance Criteria
1. The README shall `.env`ファイルの全変数名とその説明をテーブル形式で記載する
2. The README shall 変数をカテゴリ（Database, Remote Server, Remote SSH）ごとに分類して記載する
