---
title: 'JavaScript 비동기 프로그래밍 완벽 가이드'
date: 2025-01-27
tags: ['JavaScript', '비동기', '프로그래밍', 'Promise', 'async-await']
category: '개발'
description: 'JavaScript 비동기 프로그래밍의 기초부터 고급 패턴까지 완벽하게 이해하기'
---

# JavaScript 비동기 프로그래밍 완벽 가이드 🔄

JavaScript의 비동기 프로그래밍은 초보자들에게 가장 어려운 개념 중 하나입니다. 콜백 지옥부터 Promise, 그리고 async/await까지 현대 JavaScript의 비동기 처리 방법을 자세히 알아보겠습니다.

## 📚 목차

- 콜백 함수의 문제점
- Promise의 등장
- async/await 문법
- 실전 예제
- 에러 처리 전략

## 콜백 지옥 (Callback Hell)

과거 JavaScript에서는 비동기 작업을 처리하기 위해 콜백 함수를 사용했습니다:

```javascript
// 콘솔 로그: 콜백 기반 비동기 처리 시작
console.log('[콜백] 비동기 처리 시작');

getUserData(userId, function(user) {
  console.log('[콜백] 사용자 데이터 조회 완료:', user.name);

  getPosts(user.id, function(posts) {
    console.log('[콜백] 게시글 목록 조회 완료:', posts.length + '개');

    posts.forEach(function(post, index) {
      getComments(post.id, function(comments) {
        console.log(`[콜백] 게시글 ${index + 1}의 댓글 조회 완료:`, comments.length + '개');

        // 더 깊은 중첩...
      });
    });
  });
});

// 에러 처리도 복잡함
getUserData(userId, function(error, user) {
  if (error) {
    console.error('[콜백] 사용자 데이터 조회 실패:', error);
    return;
  }

  getPosts(user.id, function(error, posts) {
    if (error) {
      console.error('[콜백] 게시글 조회 실패:', error);
      return;
    }
    // ...
  });
});
```

이런 코드는 "콜백 지옥"이라고 불리며, 가독성과 유지보수성이 매우 떨어집니다.

## 🎯 Promise로 해결하기

ES6에서 도입된 Promise는 비동기 작업을 더 깔끔하게 처리할 수 있게 해줍니다:

```javascript
// 콘솔 로그: Promise 기반 비동기 처리 시작
console.log('[Promise] 비동기 처리 시작');

function getUserData(userId) {
  console.log(`[Promise] 사용자 ${userId} 데이터 조회 시작`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 'invalid') {
        console.error('[Promise] 사용자 조회 실패: 유효하지 않은 ID');
        reject(new Error('유효하지 않은 사용자 ID'));
        return;
      }

      const user = { id: userId, name: '홍길동' };
      console.log('[Promise] 사용자 데이터 조회 성공:', user);
      resolve(user);
    }, 1000);
  });
}

function getPosts(userId) {
  console.log(`[Promise] 사용자 ${userId}의 게시글 조회 시작`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const posts = [
        { id: 1, title: '첫 번째 글', userId },
        { id: 2, title: '두 번째 글', userId }
      ];
      console.log('[Promise] 게시글 조회 성공:', posts.length + '개');
      resolve(posts);
    }, 800);
  });
}

// Promise 체이닝
getUserData('user123')
  .then(user => {
    console.log('[Promise] 사용자 정보:', user);
    return getPosts(user.id);
  })
  .then(posts => {
    console.log('[Promise] 게시글 목록:', posts);
    return posts.length;
  })
  .then(count => {
    console.log(`[Promise] 총 ${count}개의 게시글을 찾았습니다`);
  })
  .catch(error => {
    console.error('[Promise] 처리 중 오류 발생:', error.message);
  });
```

## ⚡ async/await로 더 간단하게

ES8에서 도입된 async/await는 Promise를 더 직관적으로 사용할 수 있게 해줍니다:

```javascript
// 콘솔 로그: async/await 기반 비동기 처리 시작
console.log('[Async] async/await 비동기 처리 시작');

async function processUserData(userId) {
  try {
    console.log(`[Async] 사용자 ${userId} 처리 시작`);

    // 마치 동기 코드처럼 작성
    const user = await getUserData(userId);
    console.log('[Async] 사용자 조회 성공:', user);

    const posts = await getPosts(user.id);
    console.log('[Async] 게시글 조회 성공:', posts.length + '개');

    const comments = await getComments(posts[0].id);
    console.log('[Async] 첫 번째 게시글 댓글 조회 성공:', comments.length + '개');

    return {
      user,
      posts,
      comments
    };

  } catch (error) {
    console.error('[Async] 처리 중 오류 발생:', error.message);
    throw error;
  }
}

// 사용 예시
async function main() {
  try {
    const result = await processUserData('user123');
    console.log('[Async] 모든 데이터 처리 완료:', result);
  } catch (error) {
    console.error('[Async] 메인 함수 오류:', error);
  }
}

main();
```

## 🔄 병렬 처리와 최적화

여러 비동기 작업을 효율적으로 처리하는 방법들:

```javascript
// 콘솔 로그: 병렬 처리 시작
console.log('[병렬] 다중 비동기 작업 시작');

async function fetchAllUserData(userIds) {
  console.log(`[병렬] ${userIds.length}명의 사용자 데이터 동시 조회 시작`);

  // Promise.all로 병렬 처리
  const promises = userIds.map(id => getUserData(id));
  const users = await Promise.all(promises);

  console.log('[병렬] 모든 사용자 데이터 조회 완료');
  return users;
}

async function fetchWithFallback(primaryId, fallbackId) {
  console.log(`[병렬] ${primaryId} 우선 조회, 실패시 ${fallbackId}로 폴백`);

  try {
    // Promise.race로 가장 빠른 응답 사용
    const result = await Promise.race([
      getUserData(primaryId),
      getUserData(fallbackId)
    ]);
    console.log('[병렬] 가장 빠른 응답 수신:', result);
    return result;
  } catch (error) {
    console.log('[병렬] 두 요청 모두 실패, 하나씩 재시도');

    // 하나씩 시도
    try {
      return await getUserData(primaryId);
    } catch {
      return await getUserData(fallbackId);
    }
  }
}

// 실제 사용 예
async function demonstrateParallel() {
  const userIds = ['user1', 'user2', 'user3'];

  // 병렬 처리
  const users = await fetchAllUserData(userIds);
  console.log('[병렬] 병렬 처리 결과:', users.map(u => u.name));

  // 폴백 처리
  const user = await fetchWithFallback('validUser', 'fallbackUser');
  console.log('[병렬] 폴백 처리 결과:', user.name);
}

demonstrateParallel();
```

## 🛡️ 에러 처리 전략

비동기 코드에서 에러를 효과적으로 처리하는 방법:

```javascript
// 콘솔 로그: 에러 처리 전략 데모 시작
console.log('[에러처리] 다양한 에러 처리 패턴 데모');

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

async function safeApiCall(apiFunction, ...args) {
  try {
    console.log('[에러처리] API 호출 시도');
    const result = await apiFunction(...args);
    console.log('[에러처리] API 호출 성공');
    return result;
  } catch (error) {
    console.error('[에러처리] API 호출 실패:', error.message);

    // 재시도 로직
    if (error.statusCode === 500) {
      console.log('[에러처리] 500 에러, 1초 후 재시도');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return safeApiCall(apiFunction, ...args);
    }

    throw error;
  }
}

async function fetchUserWithRetry(userId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[에러처리] 시도 ${attempt}/${maxRetries}: 사용자 ${userId} 조회`);
      return await getUserData(userId);
    } catch (error) {
      console.error(`[에러처리] 시도 ${attempt} 실패:`, error.message);

      if (attempt === maxRetries) {
        console.error('[에러처리] 최대 재시도 횟수 초과');
        throw new Error(`사용자 조회 실패 (최대 ${maxRetries}회 시도)`);
      }

      // 지수 백오프: 1초, 2초, 4초...
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`[에러처리] ${delay}ms 후 재시도`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 실제 사용
async function demonstrateErrorHandling() {
  try {
    // 재시도 로직 데모
    const user = await fetchUserWithRetry('user123');
    console.log('[에러처리] 최종 성공:', user);

  } catch (error) {
    console.error('[에러처리] 모든 시도 실패:', error.message);
  }
}

demonstrateErrorHandling();
```

## 🎨 실전 패턴들

현업에서 자주 사용하는 비동기 패턴들:

```javascript
// 콘솔 로그: 실전 패턴 데모 시작
console.log('[실전] 실전 비동기 패턴 데모');

// 1. 로딩 상태 관리
class AsyncLoader {
  constructor() {
    this.loading = false;
    this.cache = new Map();
  }

  async load(key, loaderFn) {
    if (this.cache.has(key)) {
      console.log(`[실전] 캐시된 데이터 사용: ${key}`);
      return this.cache.get(key);
    }

    if (this.loading) {
      console.log('[실전] 이미 로딩 중, 대기...');
      return new Promise((resolve, reject) => {
        // 실제로는 이벤트나 다른 메커니즘 사용
        setTimeout(() => resolve(this.cache.get(key)), 100);
      });
    }

    this.loading = true;
    console.log(`[실전] 데이터 로드 시작: ${key}`);

    try {
      const data = await loaderFn();
      this.cache.set(key, data);
      console.log(`[실전] 데이터 로드 완료 및 캐시 저장: ${key}`);
      return data;
    } finally {
      this.loading = false;
    }
  }
}

// 2. 디바운스된 검색
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

class SearchService {
  constructor() {
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
  }

  async search(query) {
    console.log(`[실전] 검색 요청: "${query}"`);
    return this.debouncedSearch(query);
  }

  async performSearch(query) {
    if (!query.trim()) {
      console.log('[실전] 빈 검색어, 결과 없음');
      return [];
    }

    console.log(`[실전] 실제 검색 수행: "${query}"`);

    // 모의 검색
    await new Promise(resolve => setTimeout(resolve, 500));

    const results = [
      'JavaScript 기초',
      '비동기 프로그래밍',
      'Promise와 async/await',
      '에러 처리 전략'
    ].filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    console.log(`[실전] 검색 결과: ${results.length}개 항목`);
    return results;
  }
}

// 사용 예시
async function demonstrateRealWorld() {
  const loader = new AsyncLoader();
  const searchService = new SearchService();

  // 캐싱된 로더 데모
  const user1 = await loader.load('user1', () => getUserData('user1'));
  const user1Again = await loader.load('user1', () => getUserData('user1'));
  console.log('[실전] 캐시된 로더 결과:', user1.name, user1Again.name);

  // 디바운스된 검색 데모
  const results1 = await searchService.search('java');
  const results2 = await searchService.search('javascript');
  const results3 = await searchService.search('async');

  console.log('[실전] 검색 결과들:', {
    java: results1,
    javascript: results2,
    async: results3
  });
}

demonstrateRealWorld();
```

## 📝 요약

JavaScript 비동기 프로그래밍의 발전 과정:

1. **콜백 함수** → 코드가 복잡해짐 (콜백 지옥)
2. **Promise** → 체이닝으로 가독성 향상, 에러 처리 개선
3. **async/await** → 동기 코드처럼 작성 가능
4. **고급 패턴들** → 캐싱, 재시도, 디바운싱 등

비동기 프로그래밍은 JavaScript의 핵심 개념 중 하나입니다. Promise와 async/await를 적절히 활용하면 콜백 지옥을 탈출하고, 유지보수하기 쉬운 코드를 작성할 수 있습니다.

> 💡 **팁**: 항상 에러 처리를 잊지 마세요. 비동기 코드는 특히 에러가 발생하기 쉽습니다!

더 자세한 내용은 [MDN Web Docs](https://developer.mozilla.org/ko/docs/Learn/JavaScript/Asynchronous)에서 확인하세요.
