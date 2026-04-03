const username = "neariot";
const projectsContainer = document.getElementById("projects");

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function renderProjects(repos) {
  if (!repos.length) {
    projectsContainer.innerHTML =
      '<article class="project-card"><p class="status">No repositories to show yet.</p></article>';
    return;
  }

  projectsContainer.innerHTML = repos
    .map(
      (repo) => `
        <article class="project-card">
          <p class="project-name"><a href="${repo.html_url}">${repo.name}</a></p>
          <p class="project-description">${repo.description || "No description yet."}</p>
          <p class="project-meta">Updated ${formatDate(repo.updated_at)}</p>
          <div class="project-tags">
            ${repo.language ? `<span class="tag">${repo.language}</span>` : ""}
            <span class="tag">${repo.stargazers_count} stars</span>
          </div>
        </article>
      `
    )
    .join("");
}

async function loadProfile() {
  const profileResponse = await fetch(`https://api.github.com/users/${username}`);
  if (!profileResponse.ok) {
    throw new Error("Failed to fetch profile data");
  }

  const profile = await profileResponse.json();
  document.getElementById("repo-count").textContent = profile.public_repos;
  document.getElementById("follower-count").textContent = profile.followers;
  document.getElementById("following-count").textContent = profile.following;
}

async function loadProjects() {
  const reposResponse = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
  );
  if (!reposResponse.ok) {
    throw new Error("Failed to fetch repository data");
  }

  const repos = await reposResponse.json();
  const curated = repos
    .filter((repo) => !repo.fork)
    .sort((left, right) => {
      if (right.stargazers_count !== left.stargazers_count) {
        return right.stargazers_count - left.stargazers_count;
      }

      return new Date(right.updated_at) - new Date(left.updated_at);
    })
    .slice(0, 6);

  renderProjects(curated);
}

async function initialize() {
  try {
    await Promise.all([loadProfile(), loadProjects()]);
  } catch (error) {
    projectsContainer.innerHTML =
      '<article class="project-card"><p class="status">GitHub data is temporarily unavailable. Check back soon.</p></article>';
  }
}

initialize();
