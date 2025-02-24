import { ThumbnailQueue } from "./thumbnailQueue";

// メタデータのみを先に収集
async function collectMetadata() {
  const sceneModules = import.meta.glob(
    "../../src/usecases/usecase-*/index.js",
    {
      eager: true,
    }
  );

  const sceneData = [];

  for (const path in sceneModules) {
    const module = sceneModules[path];
    if (module.default && module.default.metadata) {
      const metadata = {
        ...module.default.metadata,
        thumbnailUrl: null,
        thumbnailGenerated: false,
        module: module.default, // モジュール参照を保持
      };
      sceneData.push(metadata);
    }
  }

  return sceneData.sort((a, b) => b.id.localeCompare(a.id));
}

// サムネイル生成用のキューを管理するクラス
class ThumbnailManager {
  constructor() {
    this.queue = new ThumbnailQueue(1);
    this.pendingThumbnails = new Map();
  }

  async generateThumbnail(scene) {
    // 既に生成済みまたは生成中の場合はそれを返す
    if (scene.thumbnailGenerated) return scene.thumbnailUrl;
    if (this.pendingThumbnails.has(scene.id)) {
      return this.pendingThumbnails.get(scene.id);
    }

    // 新しいサムネイル生成タスクを作成
    const thumbnailPromise = (async () => {
      try {
        if (typeof scene.module.getThumbnailBlob === "function") {
          const thumbnailBlob = await this.queue.add(async (renderer) => {
            return await renderer.generateThumbnail(scene.module, 200, 200);
          });

          if (thumbnailBlob) {
            scene.thumbnailUrl = URL.createObjectURL(thumbnailBlob);
            scene.thumbnailGenerated = true;
            return scene.thumbnailUrl;
          }
        }
      } catch (error) {
        console.warn(
          `Failed to generate thumbnail for scene ${scene.id}:`,
          error
        );
      } finally {
        this.pendingThumbnails.delete(scene.id);
      }
      return null;
    })();

    this.pendingThumbnails.set(scene.id, thumbnailPromise);
    return thumbnailPromise;
  }

  dispose() {
    this.queue.dispose();
  }
}

// グローバルなThumbnailManagerインスタンス
const thumbnailManager = new ThumbnailManager();

export async function collectSceneData() {
  // まずメタデータのみを収集して返す
  const sceneData = await collectMetadata();

  // 各シーンにサムネイル生成メソッドを追加
  return sceneData.map((scene) => ({
    ...scene,
    loadThumbnail: async () => {
      if (!scene.thumbnailUrl && !scene.thumbnailGenerated) {
        return await thumbnailManager.generateThumbnail(scene);
      }
      return scene.thumbnailUrl;
    },
  }));
}

// クリーンアップ用のメソッドを追加
export function disposeThumbnailSystem() {
  thumbnailManager.dispose();
}
