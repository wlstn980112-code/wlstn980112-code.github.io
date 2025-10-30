/**
 * 게시글 로더 및 표시 모듈
 * 마크다운 파일 로드, 파싱, Giscus 통합
 */

// 콘솔 로그: 포스트 로더 초기화 시작
console.log('[PostLoader] 포스트 로더 모듈 초기화 시작');

// 전역 변수들
let currentPost = null;
let allPosts = [];

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('[PostLoader] DOM 로드 완료, 포스트 로더 초기화 실행');
  initializePostLoader();
});

/**
 * 포스트 로더 초기화
 */
function initializePostLoader() {
  // URL 파라미터에서 파일명 추출
  const urlParams = new URLSearchParams(window.location.search);
  const filename = urlParams.get('file');

  if (!filename) {
    console.error('[PostLoader] 파일 파라미터가 없습니다');
    showError('게시글 파일을 찾을 수 없습니다.');
    return;
  }

  console.log(`[PostLoader] 게시글 로드 시작: ${filename}`);

  // posts.json과 마크다운 파일 동시 로드
  Promise.all([
    fetch('posts.json').then(r => r.json()),
    fetch(`pages/${filename}`).then(r => r.text())
  ])
  .then(([postsData, markdownContent]) => {
    console.log('[PostLoader] 데이터 로드 성공');
    allPosts = postsData;

    // 현재 포스트 메타데이터 찾기
    currentPost = postsData.find(post => post.file === filename);

    if (!currentPost) {
      throw new Error(`게시글 메타데이터를 찾을 수 없습니다: ${filename}`);
    }

    // 게시글 렌더링
    renderPost(markdownContent, currentPost);

    // 이전/다음 게시글 네비게이션 설정
    setupNavigation();

    // Giscus 댓글 로드
    loadGiscus();

    // Open Graph 메타 태그 설정
    setOpenGraphTags();
  })
  .catch(error => {
    console.error('[PostLoader] 게시글 로드 실패:', error);
    showError('게시글을 불러오는 중 오류가 발생했습니다.');
  });
}

/**
 * 게시글 렌더링
 */
function renderPost(markdownContent, post) {
  console.log('[PostLoader] 게시글 렌더링 시작');

  // 제목 설정
  const titleElement = document.getElementById('post-title');
  const titleDisplay = document.getElementById('post-title-display');
  if (titleElement) titleElement.textContent = post.title;
  if (titleDisplay) titleDisplay.textContent = post.title;

  // 날짜 설정
  const dateElement = document.getElementById('post-date');
  if (dateElement) {
    dateElement.textContent = formatDate(post.date);
    dateElement.setAttribute('datetime', post.date);
  }

  // 태그 설정
  const tagsElement = document.getElementById('post-tags');
  if (tagsElement && post.tags.length > 0) {
    const tagsHtml = post.tags.map(tag =>
      `<span class="post-tag-display">${tag}</span>`
    ).join('');
    tagsElement.innerHTML = tagsHtml;
  }

  // 카테고리 설정
  const categoryElement = document.getElementById('post-category');
  if (categoryElement && post.category) {
    categoryElement.textContent = post.category;
  }

  // 마크다운을 HTML로 변환
  const htmlContent = marked.parse(markdownContent);
  const contentElement = document.getElementById('post-content');
  if (contentElement) {
    contentElement.innerHTML = htmlContent;
  }

  // 코드 블록 하이라이팅 적용
  setTimeout(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      Prism.highlightElement(block);
    });
    console.log('[PostLoader] 코드 하이라이팅 적용 완료');
  }, 100);

  console.log('[PostLoader] 게시글 렌더링 완료');
}

/**
 * 이전/다음 게시글 네비게이션 설정
 */
function setupNavigation() {
  if (!currentPost || !allPosts.length) return;

  console.log('[PostLoader] 네비게이션 설정 시작');

  // 날짜순 정렬 (최신순)
  const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentIndex = sortedPosts.findIndex(post => post.file === currentPost.file);

  // 이전 게시글
  const prevPost = sortedPosts[currentIndex + 1];
  const prevLink = document.getElementById('prev-post');
  if (prevLink && prevPost) {
    prevLink.href = `post.html?file=${encodeURIComponent(prevPost.file)}`;
    prevLink.style.display = 'inline-block';
    prevLink.innerHTML = `← ${prevPost.title}`;
  }

  // 다음 게시글
  const nextPost = sortedPosts[currentIndex - 1];
  const nextLink = document.getElementById('next-post');
  if (nextLink && nextPost) {
    nextLink.href = `post.html?file=${encodeURIComponent(nextPost.file)}`;
    nextLink.style.display = 'inline-block';
    nextLink.innerHTML = `${nextPost.title} →`;
  }

  console.log('[PostLoader] 네비게이션 설정 완료');
}

/**
 * Giscus 댓글 시스템 로드
 */
function loadGiscus() {
  console.log('[PostLoader] Giscus 댓글 시스템 로드 시작');

  const container = document.getElementById('giscus-container');
  if (!container) {
    console.warn('[PostLoader] Giscus 컨테이너를 찾을 수 없습니다');
    return;
  }

  // 기존 Giscus 제거
  container.innerHTML = '';

  // Giscus 스크립트 생성
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;

  // Giscus 설정 (여기서 설정을 변경하세요)
  script.setAttribute('data-repo', 'your-github-username/your-github-username.github.io');
  script.setAttribute('data-repo-id', 'YOUR_REPO_ID');
  script.setAttribute('data-category', 'General');
  script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID');
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '1');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', 'preferred_color_scheme');
  script.setAttribute('data-lang', 'ko');
  script.setAttribute('crossorigin', 'anonymous');

  // 로드 완료 이벤트
  script.onload = function() {
    console.log('[PostLoader] Giscus 댓글 시스템 로드 완료');
  };

  script.onerror = function() {
    console.error('[PostLoader] Giscus 댓글 시스템 로드 실패');
    container.innerHTML = '<p>댓글 시스템을 불러올 수 없습니다.</p>';
  };

  container.appendChild(script);
}

/**
 * Open Graph 메타 태그 설정
 */
function setOpenGraphTags() {
  if (!currentPost) return;

  console.log('[PostLoader] Open Graph 메타 태그 설정 시작');

  const baseUrl = window.location.origin;
  const postUrl = `${baseUrl}/post.html?file=${encodeURIComponent(currentPost.file)}`;

  // 제목
  setMetaTag('og:title', currentPost.title);
  setMetaTag('post-title', currentPost.title);

  // 설명
  setMetaTag('og:description', currentPost.description || currentPost.excerpt);
  setMetaTag('post-description', currentPost.description || currentPost.excerpt);

  // URL
  setMetaTag('og:url', postUrl);
  setMetaTag('og:url', postUrl);

  // 발행 시간
  setMetaTag('article:published_time', new Date(currentPost.date).toISOString());

  // 태그들
  if (currentPost.tags.length > 0) {
    setMetaTag('article:tag', currentPost.tags.join(','));
  }

  console.log('[PostLoader] Open Graph 메타 태그 설정 완료');
}

/**
 * 메타 태그 설정 헬퍼 함수
 */
function setMetaTag(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`) ||
                document.querySelector(`meta[property="${name}"]`);

  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('article:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
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
  const contentElement = document.getElementById('post-content');
  if (contentElement) {
    contentElement.innerHTML = `<div class="error" style="text-align: center; padding: 3rem; color: var(--text-secondary);">${message}</div>`;
  }

  console.error('[PostLoader] 에러 표시:', message);
}

// 전역 함수로 노출
window.loadGiscus = loadGiscus;
window.getCurrentPost = function() {
  return currentPost;
};

console.log('[PostLoader] 포스트 로더 모듈 초기화 완료');
