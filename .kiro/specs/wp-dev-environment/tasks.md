# Implementation Plan

- [x] 1. プロジェクト基盤セットアップ
- [x] 1.1 ディレクトリ構造とpackage.json・tsconfig.jsonの初期化
  - プロジェクトルートにsrc/scss/, src/ts/, wordpress/wp-content/themes/ のディレクトリ階層を作成する
  - package.jsonを初期化し、devDependenciesにvite, sass, typescriptを定義する
  - tsconfig.jsonをTypeScriptコンパイル設定として作成する（strict有効、DOM lib含む）
  - _Requirements: 5.1, 5.3_

- [x] 1.2 環境変数テンプレートとGit除外設定
  - .env.exampleを作成し、DB接続情報（DB_NAME, DB_USER, DB_PASSWORD, DB_ROOT_PASSWORD）とリモート接続情報（REMOTE_URL, REMOTE_SSH_HOST等）の全変数名をコメント付きで列挙する
  - .gitignoreを作成し、.env, node_modules, wordpress/（テーマディレクトリ以外）、ビルド出力（assets/）を除外対象にする
  - _Requirements: 5.2_

- [x] 2. (P) Docker Composeによるローカル環境構築
  - docker-compose.ymlを作成し、wordpressサービス（wordpress:php8.3-apache、ポート8080:80）とdbサービス（mariadb:11）を定義する
  - wordpressサービスにテーマディレクトリのバインドマウントを設定し、ホスト側の変更がコンテナ内に即座に反映されるようにする
  - dbサービスにnamed volume（db_data）を設定し、データベースの永続化を実現する
  - 環境変数を.envファイルから読み込む形式でDB接続情報を設定する
  - depends_onでwordpressがdbの起動後に開始されるよう順序を制御する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Viteビルドパイプラインとテーマ構築
- [x] 3.1 (P) Viteビルド設定とフロントエンドソースの初期化
  - vite.config.tsを作成し、rollupOptions.inputでSCSSエントリポイント（src/scss/style.scss）とTypeScriptエントリポイント（src/ts/main.ts）を定義する
  - ビルド出力先をWordPressテーマのassetsディレクトリに設定し、ファイル名をハッシュなしで固定化する（WordPressのエンキューとの整合性確保）
  - src/scss/style.scssを初期SCSSエントリポイントとして作成し、_variables.scssの読み込みを含める
  - src/ts/main.tsを初期TypeScriptエントリポイントとして作成する
  - npm run devでbuild --watch、npm run buildで本番ビルド（ミニファイ有効）が実行される設定とする
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.2 WordPressテーマ雛形とビルドアセット読み込み設定
  - テーマ識別用のstyle.css（WordPressテーマヘッダーコメント）を作成する
  - index.phpをテーマの最小テンプレートとして作成する
  - functions.phpを作成し、wp_enqueue_styleとwp_enqueue_scriptでViteビルド出力のCSS/JSファイルをWordPressに読み込ませる処理を記述する
  - ビルド出力先のassetsディレクトリがテーマ内に配置され、Viteの出力がそのまま使用される構成とする
  - _Requirements: 2.3_

- [x] 4. (P) Wordmoveリモート同期設定
  - Movefile.ymlを作成し、local環境（localhost:8080、DB接続先はdocker composeのdbサービス）とproduction環境（リモートサーバー）の接続情報をERB構文で環境変数から参照する形式で定義する
  - productionのforbidセクションで全pushオペレーション（db, uploads, themes, plugins, languages, mu_plugins）を禁止し、pull専用に制限する
  - SSH接続は公開鍵認証を前提とし、passwordフィールドを省略する
  - Wordmove Dockerイメージ（welaika/wordmove）経由でpullを実行するnpm scriptを定義し、必要なボリューム（Movefile.yml, .env, SSH鍵, wordpressディレクトリ）のマウントとDocker Composeネットワークへの接続を含める
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. (P) GitHub Actionsデプロイワークフロー構築
  - .github/workflows/deploy.ymlを作成し、mainブランチへのpushをトリガーとするデプロイワークフローを定義する
  - ワークフロー内でNode.jsセットアップ、npm ci、npm run buildの順にビルドを実行する
  - webfactory/ssh-agentでSSH鍵を設定し、rsyncでテーマディレクトリをリモートサーバーへ転送する
  - rsyncの除外パターンに.git, node_modules, src, .envを指定し、不要ファイルの転送を防止する
  - SSH_PRIVATE_KEY, SSH_HOST, SSH_USER, REMOTE_THEME_PATHをGitHub Secretsから参照する構成とする
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. npm scripts統合と全体動作確認
  - package.jsonのscriptsにdev（vite build --watch）、build（vite build）、up（docker compose up -d）、down（docker compose down）、pull:db、pull:uploadsの全コマンドを集約する
  - docker compose upでWordPressがlocalhost:8080でアクセス可能になることを確認する
  - npm run devでSCSS/TSの変更がテーマのassetsディレクトリに反映されることを確認する
  - npm run buildでミニファイ済みアセットが生成されることを確認する
  - _Requirements: 5.4_
