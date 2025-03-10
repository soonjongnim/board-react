import React from 'react';
import {useEffect, useLayoutEffect, useState, ChangeEvent, useRef} from 'react';
import './style.css';
import ImageZoom from "components/ImageZoom";
import { Item } from 'types/interface';

import defaultProfileImage from 'assets/images/default-profile-image.png';
import { useLoginUserStore } from 'stores';
import { useNavigate, useParams } from 'react-router-dom';
import { ITEM_PATH, MAIN_PATH, USER_PATH } from 'constant';
import { deleteItemRequest, getItemRequest } from 'apis';
import GetItemResponseDto from 'apis/response/item/get-item.response.dto';
import { ResponseDto } from 'apis/response';
import { DeleteItemResponseDto } from 'apis/response/item';
import { STORE_PATH } from 'constant';

import dayjs from 'dayjs';
import { useCookies } from 'react-cookie';

export default function ItemDetail() {

  const { itemId } = useParams();
  const { loginUser } = useLoginUserStore();
  const [cookies, setCookies] = useCookies();
  
  const navigate = useNavigate();
  
  // component: 게시물 상세 상단 컴포넌트
  const ItemDetailTop = () => {
    const [isWriter, setWriter] = useState<boolean>(false);
    const [item, setItem] = useState<Item | null>(null);
    const [showMore, setShowMore] = useState<boolean>(false);
    // const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    // ✅ 이미지 줌 기능 관련 상태 및 Ref
    // const imgRef = useRef<HTMLImageElement | null>(null);
    // const lensRef = useRef<HTMLDivElement | null>(null);
    // const resultRef = useRef<HTMLDivElement | null>(null);
    // ✅ 추가: 썸네일 이미지 상태
    const [mainImage, setMainImage] = useState<string>('');
    // ✅ 탭 상태 추가
    const [activeTab, setActiveTab] = useState<string>('상품정보');
    // ✅ 탭 스크롤 관련 추가
    const tabRef = useRef<HTMLDivElement | null>(null);
    const initialTabTop = useRef<number | null>(null);

    const getWriteDatetimeFormat = () => {
      if (!item) return '';
      const date = dayjs(item.regTime);
      return date.format('YYYY. MM. DD.');
    }

    const onLogoClickHandler = () => {
      navigate(STORE_PATH());
    };
    
    const getItemResponse = (responseBody: GetItemResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'NB') alert('존재하지 않는 게시물입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') {
        navigate(MAIN_PATH());
        return;
      }

      const item: Item = { ...responseBody as GetItemResponseDto };
      setItem(item);
      setMainImage(item.thumbnailList[0]); // 초기 메인 이미지 설정

      if (!loginUser) {
        setWriter(false);
        return;
      }
      const isWriter = loginUser.email === item.writerEmail;
      setWriter(isWriter);
    }

    const deleteItemResponse = (responseBody: DeleteItemResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'VF') alert('잘못된 접근입니다.');
      if (code === 'NU') alert('존재하지 않는 유저입니다.');
      if (code === 'NB') alert('존재하지 않는 게시물입니다.');
      if (code === 'AF') alert('인증에 실패했습니다.');
      if (code === 'NP') alert('권한이 없습니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      navigate(MAIN_PATH());
    }

    const onNicknameClickHandler = () => {
      if (!item) return;
      navigate(USER_PATH(item.writerEmail));
    }

    const onMoreButtonClickHandler = () => {
      setShowMore(!showMore);
    }

    const onUpdateButtonClickHandler = () => {
      if (!item || !loginUser) return;
      if (loginUser.email !== item.writerEmail) return;
      // navigate(ITEM_PATH() + '/' + ITEM_UPDATE_PATH(item.itemId));
    }

    const onDeleteButtonClickHandler = () => {
      if (!itemId || !item || !loginUser || !cookies.accessToken) return;
      if (loginUser.email !== item.writerEmail) return;
      deleteItemRequest(itemId, cookies.accessToken).then(deleteItemResponse);
    }

    // ✅ 탭 초기 위치 저장 (useLayoutEffect 사용)
    useLayoutEffect(() => {
      if (tabRef.current) {
        initialTabTop.current = tabRef.current.getBoundingClientRect().top + window.scrollY;
      }
    }, []);

    useEffect(() => {
      if (!itemId) {
        navigate(MAIN_PATH());
        return;
      }
      getItemRequest(itemId).then(getItemResponse);
    }, [itemId]);

    if (!item) return <></>
    return (
      
      <div className="product-container">
        <div className="product-content">

          {/* ✅ 왼쪽: 메인 이미지 + 썸네일 */}
          <div className="product-image-container">
            <div className="product-image">
              <ImageZoom key={mainImage} src={mainImage} />
              {/* 🔍 돋보기 아이콘 (오른쪽 아래) */}
              <div className="zoom-icon">🔍</div>
            </div>
            {/* ✅ 썸네일 이미지 리스트 (메인 이미지 아래) */}
            <div className="thumbnail-container">
              {item.thumbnailList.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`썸네일 ${index + 1}`}
                  className={`thumbnail ${mainImage === image ? 'active' : ''}`}
                  onClick={() => setMainImage(image)} // ✅ 클릭 시 해당 이미지로 변경
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <h1>[오뚜기] 진라면 매운맛 5개입</h1>
            <p className="highlight">🔥 매운맛이 살아있는 진라면!</p>
            <p>오뚜기 진라면은 깊고 진한 국물맛으로 사랑받는 제품입니다.</p>
            <div className="price">₩4,980</div>
            <button className="cart-button" onClick={onLogoClickHandler}>결제 하기</button>
          </div>
        </div>

        {/* ✅ 탭 메뉴 추가 */}
        <div ref={tabRef} className="tab-menu">
          {['상품정보', '리뷰(6,881)', 'Q&A(4,679)', '판매자정보(반품/교환)'].map((tab) => (
            <div
              key={tab}
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* ✅ 탭 내용 */}
        <div className="tab-content">
          {activeTab === '상품정보' && (
            <div className="product-description">
              <h2>상품 설명</h2>
              <div dangerouslySetInnerHTML={{ __html: item.itemDetail || '' }} />
            </div>
          )}
          {activeTab === '리뷰(6,881)' && <div className="review-section">📝 리뷰 내용</div>}
          {activeTab === 'Q&A(4,679)' && <div className="qa-section">💬 Q&A 내용</div>}
          {activeTab === '판매자정보(반품/교환)' && <div className="seller-info-section">📦 판매자 정보</div>}
        </div>
      </div>
    );
  };
  
  return (
        <ItemDetailTop />
  )
}
