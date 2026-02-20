# Research & Design Decisions: readme-setup-guide

## Summary
- **Feature**: `readme-setup-guide`
- **Discovery Scope**: Simple Addition
- **Key Findings**:
  - プロジェクトルートにREADME.mdが存在しない（新規作成が必要）
  - 既存の`wp-dev-environment`スペックのdesign.mdに詳細なアーキテクチャ情報が記録済み
  - package.jsonに全npm scriptsが定義済み（dev, build, up, down, pull:db, pull:uploads）

## Research Log

### 既存プロジェクト構成の確認
- **Context**: READMEに記載すべき情報源の特定
- **Sources Consulted**: package.json, .env.example, vite.config.ts, tsconfig.json, .gitignore, wp-dev-environment/design.md
- **Findings**:
  - 技術スタック: Docker Compose, Vite ^6.x, sass ^1.70, TypeScript ^5.8, Wordmove (Docker), GitHub Actions
  - npm scripts: `dev`, `build`, `up`, `down`, `pull:db`, `pull:uploads` の6コマンド
  - 環境変数: Database（4変数）, Remote Server（5変数）, Remote SSH（3変数）の3カテゴリ12変数
  - ビルド出力先: `wordpress/wp-content/themes/my-theme/assets/`
  - アクセスURL: `http://localhost:8080`
- **Implications**: すべての情報がプロジェクト内のファイルから取得可能。外部調査不要

## Design Decisions

### Decision: README構成の順序
- **Context**: 新規開発者が最も効率的に環境構築を完了できるセクション順
- **Alternatives Considered**:
  1. トップダウン（概要→詳細）— 全体像から個別手順へ
  2. タスクベース（手順→リファレンス）— 作業順に並べる
- **Selected Approach**: トップダウン + タスクベースの組み合わせ。概要→前提条件→セットアップ手順→開発コマンド→ディレクトリ構成→デプロイ→環境変数リファレンス
- **Rationale**: 初回は上から下へ読み進め、以後はリファレンスとして個別セクションを参照する使い方に対応
- **Trade-offs**: セクションが多くなるが、目次で管理可能

## Risks & Mitigations
- **情報の陳腐化** — package.jsonやdocker-compose.ymlの変更時にREADMEの更新漏れが生じる可能性。初期構築時に正確な情報を記載することで最小化
- **テーマ名のハードコード** — `my-theme` がプロジェクト固有値のため、READMEでも固定値として記載する

## References
- wp-dev-environment/design.md — プロジェクトアーキテクチャの詳細設計
- package.json — npm scriptsの定義
- .env.example — 環境変数テンプレート
