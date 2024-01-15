import React from 'react';
import {useEffect, useState, ChangeEvent, useRef} from 'react';
import './style.css';
import { Board, CommentListItem, FavoriteListItem } from 'types/interface';
import FavoriteItem from 'components/FavoriteItem';
import CommentItem from 'components/CommentItem';
import Pagination from 'components/Pagination';

import defaultProfileImage from 'assets/images/default-profile-image.png';
import { useLoginUserStore } from 'stores';
import { useNavigate, useParams } from 'react-router-dom';
import { BOARD_PATH, BOARD_UPDATE_PATH, MAIN_PATH, USER_PATH } from 'constant';
import { deleteBoardRequest, getBoardRequest, getCommentListRequest, getFavoriteListRequest, increaseViewCountRequest, postCommentRequest, putFavoriteRequest } from 'apis';
import GetBoardResponseDto from 'apis/response/board/get-board.response.dto';
import { ResponseDto } from 'apis/response';
import { DeleteBoardResponseDto, GetCommentListResponseDto, GetFavoriteListResponseDto, IncreaseViewCountResponseDto, PostCommentResponseDto, PutFavoriteResponseDto } from 'apis/response/board';

import dayjs from 'dayjs';
import { useCookies } from 'react-cookie';
import { PostCommentRequestDto } from 'apis/request/board';
import { usePagination } from 'hooks';

export default function BoardDetail() {

  const { boardNumber } = useParams();
  const { loginUser } = useLoginUserStore();
  const [cookies, setCookies] = useCookies();
  
  const navigate = useNavigate();
  
  const increaseViewCountResponse = (responseBody: IncreaseViewCountResponseDto | ResponseDto | null) => {
    if (!responseBody) return;
    const { code } = responseBody;
    if (code === 'NB') alert('존재하지 않는 게시물입니다.');
    if (code === 'DBE') alert('데이터베이스 오류입니다.');
  };
  
  // component: 게시물 상세 상단 컴포넌트
  const BoardDetailTop = () => {
    const [isWriter, setWriter] = useState<boolean>(false);
    const [board, setBoard] = useState<Board | null>(null);
    const [showMore, setShowMore] = useState<boolean>(false);

    const getWriteDatetimeFormat = () => {
      if (!board) return '';
      const date = dayjs(board.writeDatetime);
      return date.format('YYYY. MM. DD.');
    }
    
    const getBoardResponse = (responseBody: GetBoardResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'NB') alert('존재하지 않는 게시물입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') {
        navigate(MAIN_PATH());
        return;
      }

      const board: Board = { ...responseBody as GetBoardResponseDto };
      setBoard(board);

      if (!loginUser) {
        setWriter(false);
        return;
      }
      const isWriter = loginUser.email === board.writerEmail;
      setWriter(isWriter);
    }

    const deleteBoardResponse = (responseBody: DeleteBoardResponseDto | ResponseDto | null) => {
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
      if (!board) return;
      navigate(USER_PATH(board.writerEmail));
    }

    const onMoreButtonClickHandler = () => {
      setShowMore(!showMore);
    }

    const onUpdateButtonClickHandler = () => {
      if (!board || !loginUser) return;
      if (loginUser.email !== board.writerEmail) return;
      navigate(BOARD_PATH() + '/' + BOARD_UPDATE_PATH(board.boardNumber));
    }

    const onDeleteButtonClickHandler = () => {
      if (!boardNumber || !board || !loginUser || !cookies.accessToken) return;
      if (loginUser.email !== board.writerEmail) return;
      deleteBoardRequest(boardNumber, cookies.accessToken).then(deleteBoardResponse);
    }

    useEffect(() => {
      if (!boardNumber) {
        navigate(MAIN_PATH());
        return;
      }
      getBoardRequest(boardNumber).then(getBoardResponse);
    }, [boardNumber]);

    if (!board) return <></>
    return (
      <div id='board-detail-top'>
        <div className='board-detail-top-header'>
          <div className='board-detail-title'>{board.title}</div>
          <div className='board-detail-top-sub-box'>
            <div className='board-detail-write-info-box'>
              <div className='board-detail-writer-profile-image' style={{ backgroundImage: `url(${board.writerProfileImage ? board.writerProfileImage : defaultProfileImage})`}}></div>
              <div className='board-detail-writer-nickname' onClick={onNicknameClickHandler}>{board.writerNickname}</div>
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
          <div className='board-detail-main-text'>{board.content}</div>
          {board.boardImageList.map((image, index) => <img key={index} className='board-detail-main-image' src={image} />)}
        </div>
      </div>
    );
  };
  
  // component: 게시물 상세 하단 컴포넌트
  const BoardDetailBottom = () => {
    const commentRef = useRef<HTMLTextAreaElement | null>(null);

    const { currentPage, setCurrentPage, currentSection, setCurrentSection, viewList,
      viewPageList, totalSection, setTotalList } = usePagination<CommentListItem>(3);
    
    const [favoriteList, setFavoriteList] = useState<FavoriteListItem[]>([]);
    const [isFavorite, setFavorite] = useState<boolean>(false);
    const [showFavorite, setShowFavorite] = useState<boolean>(false);
    const [totalCommentCount, setTotalCommentCount] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [showComment, setShowComment] = useState<boolean>(false);

    const getFavoriteListResponse = (responseBody: GetFavoriteListResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'NB') alert('존재하지 않는 게시물입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      const { favoriteList } = responseBody as GetFavoriteListResponseDto;
      setFavoriteList(favoriteList);
      if (!loginUser) return;

      const isUserFavorite = favoriteList.some(favorite => favorite.email === loginUser.email);
      if (isUserFavorite) {
        console.log("User is in the favorite list");
        setFavorite(!isFavorite);
      } else {
        console.log("User is not in the favorite list");
        setFavorite(false);
      }
    }

    const getCommentListResponse = (responseBody: GetCommentListResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'NB') alert('존재하지 않는 게시물입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      const { commentList } = responseBody as GetCommentListResponseDto;
      setTotalList(commentList);
      setTotalCommentCount(commentList.length);
    }

    const putFavoriteResponse = (responseBody: PutFavoriteResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'VF') alert('잘못된 접근입니다.');
      if (code === 'NU') alert('존재하지 않는 유저입니다.');
      if (code === 'NB') alert('존재하지 않는 게시물입니다.');
      if (code === 'AF') alert('인증에 실패했습니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      if (!boardNumber) return;
      getFavoriteListRequest(boardNumber).then(getFavoriteListResponse);
    }

    const postCommentResponse = (responseBody: PostCommentResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'VF') alert('잘못된 접근입니다.');
      if (code === 'NU') alert('존재하지 않는 유저입니다.');
      if (code === 'NB') alert('존재하지 않는 게시물입니다.');
      if (code === 'AF') alert('인증에 실패했습니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      setComment('');
      if (!boardNumber) return;
      getCommentListRequest(boardNumber).then(getCommentListResponse);
    }

    const onFavoriteClickHandler = () => {
      if (!boardNumber || !loginUser || !cookies.accessToken) return;
      putFavoriteRequest(boardNumber, cookies.accessToken).then(putFavoriteResponse);
    }

    const onShowFavoriteClickHandler = () => {
      setShowFavorite(!showFavorite);
    }

    const onShowCommentClickHandler = () => {
      setShowComment(!showComment);
    }

    const onCommentSubmitButtonClickHandler = () => {
      if (!comment || !boardNumber || !loginUser || !cookies.accessToken) return;
      const requestBody: PostCommentRequestDto = { content: comment};
      postCommentRequest(boardNumber, requestBody, cookies.accessToken).then(postCommentResponse);
    }

    const onCommentChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setComment(value);
      if (!commentRef.current) return;
      commentRef.current.style.height = 'auto';
      commentRef.current.style.height = `${commentRef.current.scrollHeight}px`;
    }

    // effect: 게시물 번호 path variable이 바뀔때 마다 좋아요 및 댓글 리스트 불러오기
    useEffect(() => {
      if (!boardNumber) return;
      getFavoriteListRequest(boardNumber).then(getFavoriteListResponse);
      getCommentListRequest(boardNumber).then(getCommentListResponse);
    }, [boardNumber]);

    return (
      <div id='board-detail-bottom'>
        <div className='board-detail-bottom-button-box'>
          <div className='board-detail-bottom-button-group'>
            <div className='icon-button' onClick={onFavoriteClickHandler}>
              {isFavorite ?
              <div className='icon favorite-fill-icon'></div> : 
              <div className='icon favorite-light-icon'></div>
              }
            </div>
            <div className='board-detail-bottom-button-text'>{`좋아요 ${favoriteList.length}`}</div>
            <div className='icon-button' onClick={onShowFavoriteClickHandler}>
              {showFavorite ? 
              <div className='icon up-light-icon'></div> : 
              <div className='icon down-light-icon'></div>
              }
            </div>
          </div>
          <div className='board-detail-bottom-button-group'>
            <div className='icon-button'>
              <div className='icon comment-icon'></div>
            </div>
            <div className='board-detail-bottom-button-text'>{`댓글 ${totalCommentCount}`}</div>
            <div className='icon-button' onClick={onShowCommentClickHandler}>
              {showComment ? 
              <div className='icon up-light-icon'></div> : 
              <div className='icon down-light-icon'></div>
              }
            </div>
          </div>
        </div>
        {showFavorite && 
        <div className='board-detail-bottom-favorite-box'>
          <div className='board-detail-bottom-favorite-container'>
            <div className='board-detail-bottom-favorite-title'>{'좋아요 '}<span className='emphasis'>{favoriteList.length}</span></div>
            <div className='board-detail-bottom-favorite-contents'>
              {favoriteList.map((item, index) => <FavoriteItem key={index} favoriteListItem={item} />)}
            </div>
          </div>
        </div>
        }
        {showComment && 
        <div className='board-detail-bottom-comment-box'>
          <div className='board-detail-bottom-comment-container'>
            <div className='board-detail-bottom-comment-title'>{'댓글 '}<span className='emphasis'>{totalCommentCount}</span></div>
            <div className='board-detail-bottom-comment-contents'>
              {viewList.map((item, index) => <CommentItem key={index} commentListItem={item} />)}
            </div>
          </div>
          <div className='divider'></div>
          <div className='board-detail-bottom-comment-pagination-box'>
            <Pagination 
              currentPage={currentPage}
              currentSection={currentSection}
              setCurrentPage={setCurrentPage}
              setCurrentSection={setCurrentSection}
              viewPageList={viewPageList}
              totalSection={totalSection}
            />
          </div>
          {loginUser !== null && 
          <div className='board-detail-bottom-comment-input-box'>
            <div className='board-detail-bottom-comment-input-container'>
              <textarea ref={commentRef} className='board-detail-bottom-comment-textarea' placeholder='댓글을 작성해주세요.' value={comment} onChange={onCommentChangeHandler} />
              <div className='board-detail-bottom-comment-button-box'>
                <div className={comment === '' ? 'disable-button' : 'black-button'} onClick={onCommentSubmitButtonClickHandler}>{'댓글달기'}</div>
              </div>
            </div>
          </div>
          }
        </div>
        }
      </div>
    );
  };

  let effectFlag = true;
  useEffect(() => {
    if (!boardNumber) return;
    if (effectFlag) {
      effectFlag = false;
      return;
    }

    increaseViewCountRequest(boardNumber).then(increaseViewCountResponse);
  }, [boardNumber]);

  return (
    <div id='board-detail-wrapper'>
      <div className='board-detail-container'>
        <BoardDetailTop />
        <BoardDetailBottom />
      </div>
    </div>
  )
}
