import { ThumbnailRenderer } from "./thumbnailRenderer";

export class ThumbnailQueue {
  constructor(maxConcurrent = 1) {
    // 同時実行数を1に制限
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
    this.renderer = new ThumbnailRenderer();
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      await new Promise((r) => setTimeout(r, 50)); // 各タスク間に少し待ち時間を入れる
      const result = await task(this.renderer);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processNext();
    }
  }

  dispose() {
    this.renderer.dispose();
  }
}
