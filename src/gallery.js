import * as THREE from "three";

async function collectSceneData() {
  const sceneModules = import.meta.glob("../src/usecases/usecase-*/index.js");
  const sceneData = [];

  for (const path in sceneModules) {
    try {
      const module = await sceneModules[path]();
      if (module.default.metadata) {
        sceneData.push(module.default.metadata);
      }
    } catch (error) {
      console.warn(`Failed to load scene metadata from ${path}:`, error);
    }
  }

  return sceneData.sort((a, b) => a.id.localeCompare(b.id));
}
async function createScenePreview(scene, container) {
  try {
    const SceneClass = (
      await import(`../src/usecases/usecase-${scene.id}/index.js`)
    ).default;
    const preview = SceneClass.createPreview(container);

    container.appendChild(preview.element);

    let animationFrame;
    function animate() {
      if (container.isConnected) {
        preview.animate();
        animationFrame = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrame);
        preview.dispose();
      }
    }
    animate();
  } catch (error) {
    console.warn(`Preview not found for scene ${scene.id}`, error);
    container.innerHTML = `
      <div class="scene-preview-placeholder">
        <div class="scene-id">#${scene.id}</div>
      </div>
    `;
  }
}

function createSceneCard(scene) {
  const card = document.createElement("div");
  card.className = "scene-card";

  // サムネイルがある場合は画像、ない場合はWebGLプレビュー
  if (scene.thumbnail) {
    card.innerHTML = `
      <div class="scene-preview">
        <img src="${scene.thumbnail}" alt="${
      scene.title
    }" style="width: 100%; height: 100%; object-fit: cover;">
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
  } else {
    card.innerHTML = `
      <div class="scene-preview"></div>
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
    const previewContainer = card.querySelector(".scene-preview");
    createScenePreview(scene, previewContainer);
  }

  card.addEventListener("click", () => {
    window.location.href = `./scene.html?id=${scene.id}`;
  });

  return card;
}
async function initGallery() {
  const gallery = document.querySelector(".gallery");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const sceneId = card.dataset.sceneId;
          const previewContainer = card.querySelector(".scene-preview");
          createScenePreview({ id: sceneId }, previewContainer);
          observer.unobserve(card);
        }
      });
    },
    { rootMargin: "100px" }
  );
  const searchInput = document.querySelector(".search-input");
  const categoryTags = document.querySelectorAll(".category-tag");

  let currentCategory = "All";
  let searchQuery = "";

  const SCENE_DATA = await collectSceneData();

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
