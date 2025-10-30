/**
 * 검색 관련 유틸리티 함수들
 * 검색어 하이라이팅, 검색 결과 분석 등
 */

// 콘솔 로그: 검색 모듈 초기화 시작
console.log('[Search] 검색 모듈 초기화 시작');

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('[Search] DOM 로드 완료, 검색 모듈 초기화 실행');
  initializeSearch();
});

/**
 * 검색 모듈 초기화
 */
function initializeSearch() {
  console.log('[Search] 검색 모듈 초기화 완료 - 유틸리티 함수들 로드됨');
}

/**
 * 검색어 하이라이팅 함수
 * @param {string} text - 원본 텍스트
 * @param {string} query - 검색어
 * @returns {string} 하이라이팅된 HTML
 */
function highlightSearchTerm(text, query) {
  if (!query || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 정규식 이스케이프 함수
 * @param {string} string - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 검색 결과 분석
 * @param {Array} posts - 게시글 배열
 * @param {string} query - 검색어
 * @returns {Object} 분석 결과
 */
function analyzeSearchResults(posts, query) {
  if (!query) return null;

  const analysis = {
    totalMatches: posts.length,
    titleMatches: 0,
    excerptMatches: 0,
    tagMatches: 0,
    query: query.toLowerCase()
  };

  posts.forEach(post => {
    const title = post.title.toLowerCase();
    const excerpt = post.excerpt.toLowerCase();
    const tags = post.tags.join(' ').toLowerCase();

    if (title.includes(analysis.query)) analysis.titleMatches++;
    if (excerpt.includes(analysis.query)) analysis.excerptMatches++;
    if (tags.includes(analysis.query)) analysis.tagMatches++;
  });

  console.log('[Search] 검색 결과 분석:', analysis);
  return analysis;
}

/**
 * 검색어 제안 생성
 * @param {string} query - 현재 검색어
 * @param {Array} allPosts - 모든 게시글
 * @returns {Array} 제안 검색어 배열
 */
function generateSearchSuggestions(query, allPosts) {
  if (!query || query.length < 2) return [];

  const suggestions = new Set();
  const queryLower = query.toLowerCase();

  allPosts.forEach(post => {
    // 제목에서 단어 추출
    post.title.toLowerCase().split(' ').forEach(word => {
      if (word.startsWith(queryLower) && word !== queryLower) {
        suggestions.add(word);
      }
    });

    // 태그에서 추출
    post.tags.forEach(tag => {
      if (tag.toLowerCase().startsWith(queryLower) && tag.toLowerCase() !== queryLower) {
        suggestions.add(tag);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5); // 최대 5개 제안
}

/**
 * 고급 검색 파싱
 * @param {string} query - 검색어
 * @returns {Object} 파싱된 검색 조건
 */
function parseAdvancedSearch(query) {
  const result = {
    text: '',
    tags: [],
    category: '',
    dateFrom: null,
    dateTo: null
  };

  if (!query) return result;

  // 태그 검색: tag:javascript
  const tagMatches = query.match(/tag:(\w+)/g);
  if (tagMatches) {
    result.tags = tagMatches.map(match => match.replace('tag:', ''));
    query = query.replace(/tag:\w+/g, '').trim();
  }

  // 카테고리 검색: category:dev
  const categoryMatch = query.match(/category:(\w+)/);
  if (categoryMatch) {
    result.category = categoryMatch[1];
    query = query.replace(/category:\w+/, '').trim();
  }

  // 날짜 범위 검색: date:2024-01-01..2024-12-31
  const dateMatch = query.match(/date:(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    result.dateFrom = dateMatch[1];
    result.dateTo = dateMatch[2];
    query = query.replace(/date:\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}/, '').trim();
  }

  // 남은 텍스트
  result.text = query;

  console.log('[Search] 고급 검색 파싱 결과:', result);
  return result;
}

// 전역 함수로 노출
window.highlightSearchTerm = highlightSearchTerm;
window.analyzeSearchResults = analyzeSearchResults;
window.generateSearchSuggestions = generateSearchSuggestions;
window.parseAdvancedSearch = parseAdvancedSearch;

console.log('[Search] 검색 모듈 초기화 완료');
