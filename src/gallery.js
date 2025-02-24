import { collectSceneData } from "./thumbnailSystem";

function createSceneCard(scene) {
  const card = document.createElement("div");
  card.className = "scene-card";

  // 基本的なカード構造を作成
  card.innerHTML = `
    <div class="scene-preview">
      <div class="scene-preview-placeholder">
        <div class="scene-id">#${scene.id}</div>
        <div class="scene-title-small">${scene.title}</div>
      </div>
    </div>
    <div class="scene-info">
      <div class="scene-title">${scene.title}</div>
      <div class="scene-description">${scene.description}</div>
      <div class="scene-categories">
        ${scene.categories
          .map((cat) => `<span class="category-badge">${cat}</span>`)
          .join("")}
      </div>
    </div>
  `;

  // サムネイルの遅延読み込み
  const loadThumbnail = async () => {
    const previewDiv = card.querySelector(".scene-preview");
    const thumbnailUrl = await scene.loadThumbnail();

    if (thumbnailUrl) {
      const img = new Image();
      img.src = thumbnailUrl;
      img.alt = scene.title;
      img.style.cssText =
        "width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s ease-in;";

      img.onload = () => {
        const placeholder = previewDiv.querySelector(
          ".scene-preview-placeholder"
        );
        if (placeholder) {
          placeholder.style.opacity = "0";
          setTimeout(() => {
            previewDiv.innerHTML = "";
            previewDiv.appendChild(img);
            requestAnimationFrame(() => {
              img.style.opacity = "1";
            });
          }, 150); // フェードアウト完了後に切り替え
        }
      };
    }
  };

  // Intersection Observerの設定
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadThumbnail();
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "50px 0px", // 画面外50pxの位置から読み込み開始
      threshold: 0.01,
    }
  );

  observer.observe(card.querySelector(".scene-preview"));

  // クリックイベントの設定
  card.addEventListener("click", () => {
    window.location.href = `./scene.html?id=${scene.id}`;
  });

  return card;
}

// スタイルの追加
const style = document.createElement("style");
style.textContent = `
  .scene-preview-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    font-family: monospace;
    transition: opacity 0.15s ease-out;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .scene-preview {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    background: #f0f0f0;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

async function initGallery() {
  const gallery = document.querySelector(".gallery");
  const searchInput = document.querySelector(".search-input");
  const categoryTags = document.querySelectorAll(".category-tag");

  let currentCategory = "All";
  let searchQuery = "";

  const SCENE_DATA = await collectSceneData();

  // Cleanup function to revoke object URLs when they're no longer needed
  function cleanup() {
    SCENE_DATA.forEach((scene) => {
      if (scene.thumbnailUrl) {
        URL.revokeObjectURL(scene.thumbnailUrl);
      }
    });
  }

  // Add cleanup on page unload
  window.addEventListener("unload", cleanup);

  function filterScenes() {
    return SCENE_DATA.filter((scene) => {
      const matchesCategory =
        currentCategory === "All" || scene.categories.includes(currentCategory);

      const matchesSearch =
        scene.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scene.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }

  function updateGallery() {
    gallery.innerHTML = "";
    const filteredScenes = filterScenes();

    if (filteredScenes.length === 0) {
      gallery.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
          No scenes found for current filters.
        </div>
      `;
    } else {
      filteredScenes.forEach((scene) => {
        gallery.appendChild(createSceneCard(scene));
      });
    }
  }

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    updateGallery();
  });

  categoryTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      categoryTags.forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
      currentCategory = tag.textContent;
      updateGallery();
    });
  });

  updateGallery();
}

initGallery();
