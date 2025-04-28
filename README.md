# Stock Monitor PWA

실시간 주식 모니터링 웹 애플리케이션입니다. React와 Express.js를 사용하여 구현되었습니다.

## 주요 기능

- 실시간 주식 가격 모니터링
- 주식 차트 표시
- 상세 주식 정보 (거래량, 시가총액, P/E 비율 등)
- 재무 데이터 표시 (수익률, ROE, ROA 등)

## 기술 스택

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Express.js
- API: Yahoo Finance API

## 설치 및 실행

1. 저장소 클론
```bash
git clone [repository-url]
cd stock-monitor-pwa
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수를 설정합니다:
```
PORT=4000
```

4. 개발 서버 실행
```bash
npm start
```

## API 엔드포인트

- `GET /api/stocks`: 주식 목록 조회
- `GET /api/stock-history`: 주식 가격 히스토리 조회
- `GET /api/news`: 주식 관련 정보 조회

## 라이선스

MIT 