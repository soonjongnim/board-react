import React from 'react'
import './style.css';
import { ItemListItem } from 'types/interface';
import { useNavigate } from 'react-router-dom';
import defaultProfileImage from 'assets/images/default-profile-image.png';
import { ITEM_DETAIL_PATH, ITEM_PATH } from 'constant';

interface Props {
    itemListItem: ItemListItem
}

export default function ItemItem({ itemListItem }: Props) {

  const { itemId, itemName, price, stockNumber } = itemListItem;
  const { itemDetail, itemSellStatus, regTime } = itemListItem;
  const { updateTime, writerEmail } = itemListItem;

  const navigate = useNavigate();

  // event handler: 게시물 아이템 클릭 이벤트 처리 함수
  const onClickHandler = () => {
    navigate(ITEM_PATH() + '/' + ITEM_DETAIL_PATH(itemId));
  }

  return (
      <div className='board-list-item' onClick={onClickHandler}>
        <div className='board-list-item-main-box'>
            <div className='board-list-item-top'>
                <div className='board-list-item-profile-box'>
                    <div className='board-list-item-profile-image' style={{ backgroundImage: `url(${updateTime ? updateTime : defaultProfileImage})` }}></div>
                </div>
                <div className='board-list-item-write-box'>
                    <div className='board-list-item-nickname'>{writerEmail}</div>
                    <div className='board-list-item-write-datetime'>{regTime}</div>
                </div>
            </div>
            <div className='board-list-item-middle'>
                <div className='board-list-item-title'>{itemName}</div>
                <div className='board-list-item-content'>{itemDetail}</div> 
            </div>
            <div className='board-list-item-bottom'>
                <div className='board-list-item-counts'>
                    {`가격 ${price} ・ 상품개수 ${stockNumber} ・ 상태 ${itemSellStatus}`}
                </div> 
            </div>
        </div>
        {/* {boardTitleImage !== null && (
            <div className='board-list-item-image-box'>
                <div className='board-list-item-image' style={{ backgroundImage: `url(${boardTitleImage})` }}></div> 
            </div>
        )} */}
    </div>
  )
}
