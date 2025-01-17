import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import './style.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AUTH_PATH, BOARD_DETAIL_PATH, BOARD_PATH, BOARD_UPDATE_PATH, BOARD_WRITE_PATH, MAIN_PATH, SEARCH_PATH, SOCIAL_OAUTH_PATH, STORE_PATH, ITEM_PATH, USER_PATH, ITEM_DETAIL_PATH } from 'constant';
import { useCookies } from 'react-cookie';
import { useBoardStore, useLoginUserStore } from 'stores';
import { fileDeleteRequest, fileUploadRequest, patchBoardRequest, postBoardRequest } from 'apis';
import { PatchBoardRequestDto, PostBoardRequestDto } from 'apis/request/board';
import { PatchBoardResponseDto, PostBoardResponseDto } from 'apis/response/board';
import { ResponseDto } from 'apis/response';

export default function Header() {
  
  const { loginUser, setLoginUser, resetLoginUser} = useLoginUserStore();
  const { pathname } = useLocation();
  const [cookies, setCookie] = useCookies();

  const [isLogin, setLogin] = useState<boolean>(false);
  const [isAuthPage, setAuthPage] = useState<boolean>(false);
  const [isSocialOauthPage, setSocialOauthPage] = useState<boolean>(false);
  const [isMainPage, setMainPage] = useState<boolean>(false);
  const [isSearchPage, setSearchPage] = useState<boolean>(false);
  const [isStorePage, setStorePage] = useState<boolean>(false);
  const [isBoardDetailPage, setBoardDetailPage] = useState<boolean>(false);
  const [isBoardWritePage, setBoardWritePage] = useState<boolean>(false);
  const [isBoardUpdatePage, setBoardUpdatePage] = useState<boolean>(false);
  const [isUserPage, setUserPage] = useState<boolean>(false);
  const [isItemDetailPage, setItemDetailPage] = useState<boolean>(false);

  const navigate = useNavigate();

  const onLogoClickHandler = () => {
    navigate(MAIN_PATH());
  };

  // 검색 버튼 컴포넌트
  const SearchButton = () => {

    // 검색어 입력 요소 참조 상태
    const searchButtonRef = useRef<HTMLDivElement | null>(null);

    const [status, setStatus] = useState<boolean>(false);

    const [word, setWord] = useState<string>('');

    // path variable 상태(검색어 파라미터명이랑 같아야함.)
    const { searchWord } = useParams();

    const onSearchWordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setWord(value);
    };

    const onSearchWordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!searchButtonRef.current) return;
      searchButtonRef.current.click();
    };

    const onSearchButtonClickHandler = () => {
      if (!status) {
        setStatus(!status);
        return;
      }
      navigate(SEARCH_PATH(word));
    };

    useEffect(() => {
      if (searchWord) {
        setWord(searchWord);
        setStatus(true);
      }

    }, [searchWord]);

    if (!status)
    // 클릭 false 상태일때
    return (
      <div className='icon-button' onClick={onSearchButtonClickHandler}>
        <div className='icon search-light-icon'></div>
      </div>
    );
    // 클릭 true 상태일때
    return (
      <div className='header-search-input-box'>
        <input className='header-search-input' type='text' placeholder='검색어를 입력해주세요.' value={word} onChange={onSearchWordChangeHandler} onKeyDown={onSearchWordKeyDownHandler} />
        <div ref={searchButtonRef} className='icon-button' onClick={onSearchButtonClickHandler}>
            <div className='icon search-light-icon'></div>
        </div>
      </div>
    );
  };

  
  // 마이페이지 버튼 컴포넌트
  const MyPageButton = () => {

    const { userEmail } = useParams();

    const onMyPageButtonClickHandler = () => {
      if (!loginUser) return;
      const { email } = loginUser;
      navigate(USER_PATH(email));
    };

    const onItemPageButtonClickHandler = () => {
      if (!loginUser) return;
      const { email } = loginUser;
      navigate(ITEM_PATH());
    };

    const onSignOutButtonClickHandler = () => {
      window.localStorage.clear();
      resetLoginUser();
      setCookie('accessToken', '', { path: MAIN_PATH(), expires: new Date() });
      navigate(MAIN_PATH());
    };

    const onSignInButtonClickHandler = () => {
      navigate(AUTH_PATH());
    };


    // if ( (isLogin) && (userEmail === loginUser?.email) )
    // return <div className='white-button' onClick={onSignOutButtonClickHandler}>{'로그아웃'}</div>;

    if (isLogin)
    // true일 경우
    return (
      <>
        <div>{loginUser?.nickname}님 로그인 중입니다.</div>
        <div className='white-button' onClick={onItemPageButtonClickHandler}>{'상품페이지'}</div>
        <div className='white-button' onClick={onMyPageButtonClickHandler}>{'마이페이지'}</div>
        <div className='white-button' onClick={onSignOutButtonClickHandler}>{'로그아웃'}</div>
      </>
    )
    
    // false일 경우
    return (
      <>
        <div className='black-button' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
      </>
    );

  };
  
  // 업로드 버튼 컴포넌트
  const UploadButton = () => {
    
    const { boardNumber } = useParams();
    const { title, content, boardImageFileList, resetBoard } = useBoardStore();

    const postBoardResponse = (responseBody: PostBoardResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code === 'AF' || code === 'NU') navigate(AUTH_PATH());
      if (code === 'VF') alert('제목과 내용은 필수입니다.');
      if (code !== 'SU') return;

      resetBoard();
      if (!loginUser) return;
      const { email } = loginUser;
      navigate(USER_PATH(email));
    }

    const patchBoardResponse = (responseBody: PatchBoardResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code === 'AF' || code === 'NU' || code === 'NB' || code === 'NP') navigate(AUTH_PATH());
      if (code === 'VF') alert('제목과 내용은 필수입니다.');
      if (code !== 'SU') return;

      if (!boardNumber) return;
      navigate(BOARD_PATH() + '/' + BOARD_DETAIL_PATH(boardNumber));
    }

    const onuploadButtonClickHandler = async () => {
      const accessToken = cookies.accessToken;
      if (!accessToken) return;

      if (boardNumber && accessToken) {
        await fileDeleteRequest(boardNumber, 'BOARD', accessToken);
      }

      const boardImageList: string[] = [];
      for (const file of boardImageFileList) {
        const data = new FormData();
        data.append('file', file);

        console.log("image file: ", file);
        const url = await fileUploadRequest(data);
        if (url) boardImageList.push(url);
      }

      const isWriterPage = pathname === BOARD_PATH() + '/' + BOARD_WRITE_PATH();
      if (isWriterPage) {
        const requestBody: PostBoardRequestDto = {
          title, content, boardImageList
        }
        postBoardRequest(requestBody, accessToken).then(postBoardResponse);
      } else {
        if (!boardNumber) return;

        const requestBody: PatchBoardRequestDto = {
          title, content, boardImageList
        }
        patchBoardRequest(boardNumber, requestBody, accessToken).then(patchBoardResponse);
      }
    };

    if (title && content)
    return <div className='black-button' onClick={onuploadButtonClickHandler}>{'업로드'}</div>;
    // 업로드 불가 버튼
    return <div className='disable-button'>{'업로드'}</div>;
    
  };

  
  // effect: path가 변경될 때 마다 실행될 함수
  useEffect(() => {
    const isAuthPage = pathname.startsWith(AUTH_PATH());
    setAuthPage(isAuthPage);
    const isSocialOauthPage = pathname.startsWith(SOCIAL_OAUTH_PATH());
    setSocialOauthPage(isSocialOauthPage);
    const isMainPage = pathname === MAIN_PATH();
    setMainPage(isMainPage);
    const isSearchPage = pathname.startsWith(SEARCH_PATH(''));
    setSearchPage(isSearchPage);
    const isStorePage = pathname.startsWith(STORE_PATH());
    setStorePage(isStorePage);
    const isBoardDetailPage = pathname.startsWith(BOARD_PATH() + '/' + BOARD_DETAIL_PATH(''));
    setBoardDetailPage(isBoardDetailPage);
    const isBoardWritePage = pathname.startsWith(BOARD_PATH() + '/' + BOARD_WRITE_PATH());
    setBoardWritePage(isBoardWritePage);
    const isBoardUpdatePage = pathname.startsWith(BOARD_PATH() + '/' + BOARD_UPDATE_PATH(''));
    setBoardUpdatePage(isBoardUpdatePage);
    const isUserPage = pathname.startsWith(USER_PATH(''));
    setUserPage(isUserPage);  
    const isItemDetailPage = pathname.startsWith(ITEM_PATH() + '/' + ITEM_DETAIL_PATH(''));
    setItemDetailPage(isItemDetailPage);

  }, [pathname]);
  
  useEffect(() => {
    setLogin(loginUser !== null);
    
  }, [loginUser]);
  
  return (
    <div id='header'>
      <div className='header-container'> 
        <div className='header-left-box' onClick={onLogoClickHandler}>
          <div className='icon-box'>
            <div className='icon logo-dark-icon'></div>
          </div>
          <div className='header-logo'>{'soon Board'}</div> 
        </div>
        <div className='header-right-box'>
          {(isAuthPage || isMainPage || isSearchPage || isBoardDetailPage || isStorePage || isItemDetailPage) && <SearchButton />}
          {(isMainPage || isSearchPage || isBoardDetailPage || isUserPage || isStorePage || isItemDetailPage) && <MyPageButton />}
          {(isBoardWritePage || isBoardUpdatePage) && <UploadButton />}
        </div>
      </div>
    </div>
  )
};
