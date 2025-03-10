import React from 'react';
import './style.css';
import { ItemListItem } from 'types/interface';
import { useNavigate } from 'react-router-dom';
import defaultProfileImage from 'assets/images/default-profile-image.png';
import { ITEM_DETAIL_PATH, ITEM_PATH } from 'constant';

interface Props {
    itemListItem: ItemListItem;
}

export default function ItemItem({ itemListItem }: Props) {
    const { itemId, itemName, price, stockNumber } = itemListItem;
    const { itemDetail, itemSellStatus, regTime } = itemListItem;
    const { updateTime, writerEmail, thumbnailUrl } = itemListItem;

    const navigate = useNavigate();

    // event handler: 게시물 아이템 클릭 이벤트 처리 함수
    const onClickHandler = () => {
        navigate(ITEM_PATH() + '/' + ITEM_DETAIL_PATH(itemId));
    };

    // 판매 상태 변환 함수 추가
    const getSellStatusText = (status: string) => {
        switch (status) {
        case 'SALE':
            return '판매중';
        case 'NOT_SALE':
            return '판매중지';
        case 'SOLD_OUT':
            return '재고없음';
        default:
            return status;
        }
    };
    
    return (
        <div className='item-list-item' onClick={onClickHandler}>
            <div className="item-container">
                <div className="item-image" style={{ backgroundImage: `url(${thumbnailUrl ? thumbnailUrl : defaultProfileImage})` }}></div>
                <div className="item-details">
                    <div>{itemName}</div>
                    <div>무료배송</div>
                </div>
                <div className="item-price">
                    <div>{price?.toLocaleString()}원</div>
                    <div className="discount">상품수량 {stockNumber}개</div>
                    <div>{getSellStatusText(itemSellStatus)}</div>
                </div>
            </div>

            {/* <div className='item-list-item-main-box'>
                <div className='item-list-item-top'>
                    <div className='item-list-item-profile-box'>
                        <div className='item-list-item-profile-image' style={{ backgroundImage: `url(${updateTime ? updateTime : defaultProfileImage})` }}></div>
                    </div>
                    <div className='item-list-item-write-box'>
                        <div className='item-list-item-nickname'>{writerEmail}</div>
                        <div className='item-list-item-write-datetime'>{regTime}</div>
                    </div>
                </div>
                <div className='item-list-item-middle'>
                    <div className='item-list-item-title'>{itemName}</div>
                    <div className='item-list-item-content'>{itemDetail}</div>
                </div>
                <div className='item-list-item-bottom'>
                    <div className='item-list-item-counts'>
                        {`가격 ${price} ・ 상품개수 ${stockNumber} ・ 상태 ${itemSellStatus}`}
                    </div>
                </div>
            </div> */}
        </div>
    );
}
