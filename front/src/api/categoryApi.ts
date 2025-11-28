// 실제 서버 주소 (나중에는 .env 파일로 관리)
const BASE_URL = 'https://api.your-backend.com'; 

// [목업 데이터] 카테고리별로 다른 데이터를 정의합니다.
const MOCK_DB: Record<string, any[]> = {
  fish: [
    {
      marketName: '망원시장',
      stores: [
        {
          storeId: 's1',
          storeName: '청정 수산',
          products: [
            { id: 'p1', name: '고등어조림 200g', price: 4800, current: 13, total: 20, img: 'https://via.placeholder.com/150' },
            { id: 'p2', name: '오징어 2마리', price: 3000, current: 4, total: 8, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    },
    {
      marketName: '노량진 수산시장',
      stores: [
        {
          storeId: 's2',
          storeName: '형제 상회',
          products: [
            { id: 'p3', name: '모둠회 소', price: 35000, current: 2, total: 5, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ],
  meat: [
    {
      marketName: '마장동 축산물시장',
      stores: [
        {
          storeId: 'm1',
          storeName: '한우 명가',
          products: [
            { id: 'm_p1', name: '1++ 등심 300g', price: 45000, current: 5, total: 10, img: 'https://via.placeholder.com/150' },
            { id: 'm_p2', name: '국거리용 양지', price: 12000, current: 8, total: 20, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ],
  vege: [
    {
      marketName: '경동시장',
      stores: [
        {
          storeId: 'v1',
          storeName: '할머니 나물',
          products: [
            { id: 'v_p1', name: '고사리 나물', price: 5000, current: 10, total: 30, img: 'https://via.placeholder.com/150' },
            { id: 'v_p2', name: '시금치 한 단', price: 2000, current: 15, total: 20, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ],
  side: [
    {
      marketName: '광장시장',
      stores: [
        {
          storeId: 'side1',
          storeName: '전라도 반찬',
          products: [
            { id: 's_p1', name: '파김치 1kg', price: 15000, current: 3, total: 10, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ]
};

export const getCategoryProducts = async (category: string, period: string) => {
  // 로딩 효과를 위해 0.3초 대기
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // 1. 서버에 요청 보내기 (GET 요청) - 실제 백엔드 연동 시 주석 해제
    /*
    const response = await fetch(`${BASE_URL}/categories/${category}?period=${period}`);
    
    // 2. 응답 성공 여부 확인
    if (!response.ok) {
      throw new Error('데이터 불러오기 실패');
    }

    // 3. JSON 데이터로 변환해서 반환
    const data = await response.json();
    return data; 
    */

    // [임시] 백엔드가 없으므로, 위에서 만든 목업 데이터를 반환합니다.
    // 해당 카테고리 데이터가 없으면 빈 배열 반환
    return MOCK_DB[category] || []; 
    
  } catch (error) {
    console.error(error);
    return []; // 에러 나면 빈 배열 반환
  }
};