/**
 * 다크/라이트 모드 토글 기능
 * 사용자의 선호도를 localStorage에 저장하고 적용합니다.
 */

// 콘솔 로그: 테마 모듈 초기화 시작
console.log('[Theme] 테마 모듈 초기화 시작');

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('[Theme] DOM 로드 완료, 테마 초기화 실행');
  initializeTheme();
});

/**
 * 테마 시스템 초기화
 */
function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');

  if (!themeToggle) {
    console.warn('[Theme] 테마 토글 버튼을 찾을 수 없습니다');
    return;
  }

  // 저장된 테마 불러오기 또는 시스템 기본값 설정
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 테마 결정 로직
  let currentTheme;
  if (savedTheme) {
    currentTheme = savedTheme;
    console.log(`[Theme] 저장된 테마 적용: ${currentTheme}`);
  } else if (systemPrefersDark) {
    currentTheme = 'dark';
    console.log('[Theme] 시스템 다크 모드 감지, 다크 모드 적용');
  } else {
    currentTheme = 'light';
    console.log('[Theme] 라이트 모드 기본 적용');
  }

  // 테마 적용
  applyTheme(currentTheme);

  // 토글 버튼 이벤트 리스너
  themeToggle.addEventListener('click', function() {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    console.log(`[Theme] 테마 토글: ${document.documentElement.getAttribute('data-theme')} → ${newTheme}`);
    applyTheme(newTheme);
  });

  // 시스템 테마 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      console.log(`[Theme] 시스템 테마 변경 감지: ${newTheme} 모드 적용`);
      applyTheme(newTheme);
    }
  });
}

/**
 * 테마 적용 함수
 * @param {string} theme - 'light' 또는 'dark'
 */
function applyTheme(theme) {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  if (!root || !themeToggle) {
    console.error('[Theme] 테마 적용 실패: 필요한 DOM 요소가 없습니다');
    return;
  }

  // 테마 적용
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // 토글 버튼 아이콘 업데이트
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.title = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';

  console.log(`[Theme] 테마 적용 완료: ${theme}`);
}

/**
 * 현재 테마 반환
 * @returns {string} 현재 테마 ('light' 또는 'dark')
 */
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * 테마 토글 함수 (외부에서 호출 가능)
 */
function toggleTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.click();
  }
}

// 전역 함수로 노출
window.getCurrentTheme = getCurrentTheme;
window.toggleTheme = toggleTheme;

console.log('[Theme] 테마 모듈 초기화 완료');
