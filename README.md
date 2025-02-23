# Three.js ショールームギャラリー

このプロジェクトは、Three.js を使用して作成されたシーンを表示するためのショールームギャラリーです。ユーザーはさまざまなカテゴリのシーンを閲覧し、検索することができます。

## プロジェクトのセットアップ

### 前提条件

- Node.js (バージョン14以上)
- npm または yarn

### インストール

1. リポジトリをクローンします。

    ```sh
    git clone https://github.com/timeless-residents/handson-threejs.git
    ```

2. プロジェクトディレクトリに移動します。

    ```sh
    cd handson-threejs
    ```

3. 依存関係をインストールします。

    ```sh
    npm install
    ```

    または

    ```sh
    yarn install
    ```

## 開発サーバーの起動

開発サーバーを起動して、プロジェクトをローカルで確認します。

```sh
npm run dev
```

または

```sh
yarn dev
```

ブラウザで `http://localhost:3000` を開いて、アプリケーションを確認します。

## ビルド

プロジェクトを本番環境用にビルドします。

```sh
npm run build
```

または

```sh
yarn build
```

`dist` フォルダにビルドされたファイルが生成されます。

## ディレクトリ構造

```
handson-threejs/
├── dist/                # ビルドされたファイル
├── src/                 # ソースコード
│   ├── gallery.js       # ギャラリーのメインスクリプト
│   └── ...              # その他のスクリプトやモジュール
├── index.html           # メインのHTMLファイル
├── styles/              # スタイルシート
│   └── main.css         # メインのスタイルシート
└── README.md            # このREADMEファイル
```

## 使用方法

1. カテゴリタグをクリックして、特定のカテゴリのシーンを表示します。
2. 検索バーにキーワードを入力して、シーンを検索します。
3. シーンカードをクリックして、詳細情報を表示します。

## 貢献

バグ報告や機能リクエストは、[Issues](https://github.com/yourusername/handson-threejs/issues) ページで受け付けています。プルリクエストも歓迎します。

## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) のもとで公開されています。
