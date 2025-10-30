const fs = require('fs');
const path = require('path');

const postsDir = 'pages';
const outputFile = 'posts.json';

console.log('[GeneratePosts] posts.json 생성 스크립트 시작');

if (!fs.existsSync(postsDir)) {
  console.log(`[GeneratePosts] ${postsDir} 디렉토리가 없습니다. 빈 posts.json을 생성합니다.`);
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
  console.log('[GeneratePosts] 빈 posts.json 생성 완료');
  process.exit(0);
}

const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith('.md'))
  .sort((a, b) => b.localeCompare(a));

console.log(`[GeneratePosts] ${files.length}개의 마크다운 파일 발견`);

const posts = files.map((filename) => {
  const filePath = path.join(postsDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');

  // Front Matter 파싱
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  let metadata = {};
  let postContent = content;

  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    postContent = frontMatterMatch[2];

    // Front Matter 라인 파싱
    const lines = frontMatter.split('\n');
    lines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 따옴표 제거
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(',')
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });
  }

  // 발췌문 생성 (첫 200자)
  const excerpt = postContent
    .replace(/#.*$/gm, '') // 헤더 제거
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/\[[\s\S]*?\]/g, '') // 링크 제거
    .replace(/\*\*.*\*\*/g, '') // 볼드 제거
    .replace(/\*.*\*/g, '') // 이탤릭 제거
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로
    .trim()
    .substring(0, 200)
    .trim();

  return {
    file: filename,
    title: metadata.title || filename.replace('.md', ''),
    date: metadata.date || new Date().toISOString().split('T')[0],
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    category: metadata.category || '',
    description: metadata.description || '',
    excerpt: excerpt + (excerpt.length === 200 ? '...' : ''),
  };
});

// 날짜순 정렬 (최신순)
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`[GeneratePosts] posts.json 생성 완료: ${posts.length}개의 게시글`);
