import React, { useEffect, useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import Pagination from 'components/Pagination';
import { ItemListItem } from 'types/interface';
import { ResponseDto } from 'apis/response';
import { GetItemListResponseDto } from 'apis/response/item';
import { getItemListRequest } from 'apis';
import { usePagination } from 'hooks';
import { SEARCH_PATH } from 'constant';
import ItemItem from 'components/ItemItem';

export default function Item() {
    const navigate = useNavigate();

    // component: 메인
    const Main = () => {

        // state: 페이지 네이션 관련 상태   
        const { currentPage, setCurrentPage, currentSection, setCurrentSection, viewList,
          viewPageList, totalSection, setTotalList } = usePagination<ItemListItem>(5);
    
        // state: 인기 검색어 게시물 리스트 상태
        const [popularWordList, setPopularWordList] = useState<string[]>([]);
    
        // function: get item list response 처리 함수       
        const getItemListResponse = (responseBody: GetItemListResponseDto | ResponseDto | null) => {
          if (!responseBody) return;
          const { code } = responseBody;
          if (code === 'DBE') alert('데이터베이스 오류입니다.');
          if (code !== 'SU') return;
    
          const { itemList } = responseBody as GetItemListResponseDto;
          console.log('itemList: ', itemList);
          setTotalList(itemList);
        }
    
        // event handler: 인기 검색어 클릭 이벤트 
        const onPopularWordClickHandler = (word: string) => {
        //   navigate(SEARCH_PATH(word));
        }
    
        // effect: 첫 마운트 시 실행될 함수
        useEffect(() => {
            getItemListRequest().then(getItemListResponse);
        }, []);
    
        // render: 메인화면 하단 컴포넌트 렌더링
        return (
          <div id='main-bottom-wrapper'>
            <div className='main-bottom-container'>
                <div className='main-bottom-title'>{'최근 상품'}</div>
                <div className='main-bottom-contents-box'>
                  <div className='main-bottom-current-contents'>
                    {viewList.map((itemListItem, index) => <ItemItem key={index} itemListItem={itemListItem} />)}
                  </div>
                  <div className='main-bottom-popular-box'>
                    <div className='main-bottom-popular-card'>
                      <div className='main-bottom-popular-card-container'>
                        <div className='main-bottom-popular-card-title'>{'인기 검색어'}</div>
                        <div className='main-bottom-popular-card-contents'>
                          {/* {popularWordList.map((word, index) => <div key={index} className='word-badge' onClick={() => onPopularWordClickHandler(word)}>{word}</div>)} */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='main-bottom-pagination-box'>
                  {<Pagination 
                    currentPage={currentPage}
                    currentSection={currentSection}
                    setCurrentPage={setCurrentPage}
                    setCurrentSection={setCurrentSection}
                    viewPageList={viewPageList}
                    totalSection={totalSection}
                  />}
                </div>
            </div>
          </div>
        );
    };
    
    return (
        <>
            <Main />
        </>
    )
}
