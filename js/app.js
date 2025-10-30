/**
 * 메인 애플리케이션 로직
 * 게시글 목록 로드 및 표시, 기본 UI 초기화
 */

// 콘솔 로그: 앱 초기화 시작
console.log('[App] 메인 애플리케이션 초기화 시작');

// 전역 변수들
let allPosts = [];
let filteredPosts = [];
let currentFilters = {
  search: '',
  tags: [],
  category: ''
};

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('[App] DOM 로드 완료, 앱 초기화 실행');
  initializeApp();
});

/**
 * 애플리케이션 초기화
 */
function initializeApp() {
  console.log('[App] 게시글 데이터 로드 시작');

  // posts.json 로드
  fetch('posts.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`[App] 게시글 데이터 로드 성공: ${data.length}개의 게시글`);
      allPosts = data;
      filteredPosts = [...allPosts];
      initializeUI();
      renderPosts();
    })
    .catch(error => {
      console.error('[App] 게시글 데이터 로드 실패:', error);
      showError('게시글을 불러오는 중 오류가 발생했습니다.');
    });
}

/**
 * UI 컴포넌트 초기화
 */
function initializeUI() {
  console.log('[App] UI 컴포넌트 초기화 시작');

  // 검색 입력 이벤트
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    console.log('[App] 검색 입력 이벤트 리스너 등록');
  }

  if (searchClear) {
    searchClear.addEventListener('click', function() {
      searchInput.value = '';
      currentFilters.search = '';
      filterPosts();
      renderPosts();
      console.log('[App] 검색어 초기화');
    });
  }

  // 필터 버튼들 생성
  createFilterButtons();

  console.log('[App] UI 컴포넌트 초기화 완료');
}

/**
 * 필터 버튼들 생성
 */
function createFilterButtons() {
  console.log('[App] 필터 버튼 생성 시작');

  const tagButtons = document.getElementById('tag-buttons');
  const categoryButtons = document.getElementById('category-buttons');

  if (!tagButtons || !categoryButtons) {
    console.warn('[App] 필터 버튼 컨테이너를 찾을 수 없습니다');
    return;
  }

  // 모든 태그 수집
  const allTags = new Set();
  const allCategories = new Set();

  allPosts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag));
    if (post.category) {
      allCategories.add(post.category);
    }
  });

  // 태그 버튼 생성
  Array.from(allTags).sort().forEach(tag => {
    const button = document.createElement('button');
    button.className = 'tag-button';
    button.textContent = tag;
    button.addEventListener('click', () => toggleTagFilter(tag));
    tagButtons.appendChild(button);
  });

  // 카테고리 버튼 생성
  Array.from(allCategories).sort().forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-button';
    button.textContent = category;
    button.addEventListener('click', () => toggleCategoryFilter(category));
    categoryButtons.appendChild(button);
  });

  console.log(`[App] 필터 버튼 생성 완료: 태그 ${allTags.size}개, 카테고리 ${allCategories.size}개`);
}

/**
 * 검색 핸들러
 */
function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.toLowerCase().trim();

  currentFilters.search = query;
  console.log(`[App] 검색어 변경: "${query}"`);

  filterPosts();
  renderPosts();
}

/**
 * 태그 필터 토글
 */
function toggleTagFilter(tag) {
  const index = currentFilters.tags.indexOf(tag);
  if (index > -1) {
    currentFilters.tags.splice(index, 1);
    console.log(`[App] 태그 필터 제거: ${tag}`);
  } else {
    currentFilters.tags.push(tag);
    console.log(`[App] 태그 필터 추가: ${tag}`);
  }

  filterPosts();
  renderPosts();
  updateFilterButtons();
}

/**
 * 카테고리 필터 토글
 */
function toggleCategoryFilter(category) {
  if (currentFilters.category === category) {
    currentFilters.category = '';
    console.log(`[App] 카테고리 필터 제거: ${category}`);
  } else {
    currentFilters.category = category;
    console.log(`[App] 카테고리 필터 설정: ${category}`);
  }

  filterPosts();
  renderPosts();
  updateFilterButtons();
}

/**
 * 게시글 필터링
 */
function filterPosts() {
  console.log('[App] 게시글 필터링 시작', currentFilters);

  filteredPosts = allPosts.filter(post => {
    // 검색어 필터
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      const matchesTitle = post.title.toLowerCase().includes(searchLower);
      const matchesExcerpt = post.excerpt.toLowerCase().includes(searchLower);
      const matchesTags = post.tags.some(tag => tag.toLowerCase().includes(searchLower));

      if (!matchesTitle && !matchesExcerpt && !matchesTags) {
        return false;
      }
    }

    // 태그 필터
    if (currentFilters.tags.length > 0) {
      const hasAllTags = currentFilters.tags.every(tag => post.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    // 카테고리 필터
    if (currentFilters.category && post.category !== currentFilters.category) {
      return false;
    }

    return true;
  });

  console.log(`[App] 필터링 결과: ${filteredPosts.length}개의 게시글`);
}

/**
 * 필터 버튼 상태 업데이트
 */
function updateFilterButtons() {
  // 태그 버튼들
  document.querySelectorAll('.tag-button').forEach(button => {
    const tag = button.textContent;
    button.classList.toggle('active', currentFilters.tags.includes(tag));
  });

  // 카테고리 버튼들
  document.querySelectorAll('.category-button').forEach(button => {
    const category = button.textContent;
    button.classList.toggle('active', currentFilters.category === category);
  });
}

/**
 * 게시글 목록 렌더링
 */
function renderPosts() {
  const postsList = document.getElementById('posts-list');
  const noPosts = document.getElementById('no-posts');
  const postsCount = document.getElementById('posts-count');

  if (!postsList || !noPosts || !postsCount) {
    console.error('[App] 게시글 렌더링 요소를 찾을 수 없습니다');
    return;
  }

  // 게시글 수 업데이트
  postsCount.textContent = filteredPosts.length;

  // 게시글 목록 초기화
  postsList.innerHTML = '';

  if (filteredPosts.length === 0) {
    noPosts.style.display = 'block';
    postsList.style.display = 'none';
    console.log('[App] 표시할 게시글이 없습니다');
    return;
  }

  noPosts.style.display = 'none';
  postsList.style.display = 'grid';

  // 게시글 카드 생성
  filteredPosts.forEach(post => {
    const postCard = createPostCard(post);
    postsList.appendChild(postCard);
  });

  console.log(`[App] 게시글 렌더링 완료: ${filteredPosts.length}개 표시`);
}

/**
 * 게시글 카드 생성
 */
function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';

  const tagsHtml = post.tags.map(tag =>
    `<span class="post-tag">${tag}</span>`
  ).join('');

  card.innerHTML = `
    <h3><a href="post.html?file=${encodeURIComponent(post.file)}">${post.title}</a></h3>
    <div class="post-meta">
      <time>${formatDate(post.date)}</time>
      ${post.category ? `<span>· ${post.category}</span>` : ''}
    </div>
    <p class="post-excerpt">${post.excerpt}</p>
    <div class="post-tags">${tagsHtml}</div>
  `;

  return card;
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 에러 표시
 */
function showError(message) {
  const postsList = document.getElementById('posts-list');
  const noPosts = document.getElementById('no-posts');

  if (postsList) {
    postsList.innerHTML = `<div class="error">${message}</div>`;
  }

  if (noPosts) {
    noPosts.style.display = 'none';
  }

  console.error('[App] 에러 표시:', message);
}

// 전역 함수로 노출 (디버깅용)
window.getAppState = function() {
  return {
    allPosts: allPosts.length,
    filteredPosts: filteredPosts.length,
    currentFilters: currentFilters
  };
};

console.log('[App] 메인 애플리케이션 초기화 완료');
