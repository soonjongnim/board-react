import React from 'react';
import {useEffect, useState, ChangeEvent, useRef} from 'react';
import './style.css';
import { Item } from 'types/interface';

import defaultProfileImage from 'assets/images/default-profile-image.png';
import { useLoginUserStore } from 'stores';
import { useNavigate, useParams } from 'react-router-dom';
import { ITEM_PATH, MAIN_PATH, USER_PATH } from 'constant';
import { deleteItemRequest, getItemRequest } from 'apis';
import GetItemResponseDto from 'apis/response/item/get-item.response.dto';
import { ResponseDto } from 'apis/response';
import { DeleteItemResponseDto } from 'apis/response/item';

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

    const getWriteDatetimeFormat = () => {
      if (!item) return '';
      const date = dayjs(item.regTime);
      return date.format('YYYY. MM. DD.');
    }
    
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

    useEffect(() => {
      if (!itemId) {
        navigate(MAIN_PATH());
        return;
      }
      getItemRequest(itemId).then(getItemResponse);
    }, [itemId]);

    if (!item) return <></>
    return (
      <div id='board-detail-top'>
        <div className='board-detail-top-header'>
          <div className='board-detail-title'>{item.itemName}</div>
          <div className='board-detail-top-sub-box'>
            <div className='board-detail-write-info-box'>
              {/* <div className='board-detail-writer-profile-image' style={{ backgroundImage: `url(${item.writerProfileImage ? item.writerProfileImage : defaultProfileImage})`}}></div> */}
              <div className='board-detail-writer-nickname' onClick={onNicknameClickHandler}>가격: {item.price}</div>
              <div className='board-detail-info-divider'>{'\|'}</div>
              <div className='board-detail-write-date'>{getWriteDatetimeFormat()}</div>
            </div>
            {isWriter && 
            <div className='icon-button' onClick={onMoreButtonClickHandler}>
              <div className='icon more-icon'></div>
            </div>
            }
            {showMore && 
            <div className='board-detail-more-box'>
              <div className='board-detail-update-button' onClick={onUpdateButtonClickHandler}>{'수정'}</div>
              <div className='divider'></div>
              <div className='board-detail-delete-button' onClick={onDeleteButtonClickHandler}>{'삭제'}</div>
            </div>}
          </div>
        </div>
        <div className='divider'></div>
        <div className='board-detail-top-main'>
          <div>stockNumber : {item.stockNumber}</div>
          <div>itemSellStatus : {item.itemSellStatus}</div>
          <div className='board-detail-main-text'>{item.itemDetail}</div>
          {/* {item.boardImageList.map((image, index) => <img key={index} className='board-detail-main-image' src={image} />)} */}
        </div>
      </div>
    );
  };
  
  return (
    <div id='board-detail-wrapper'>
      <div className='board-detail-container'>
        <ItemDetailTop />
      </div>
    </div>
  )
}
