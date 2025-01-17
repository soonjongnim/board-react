import React, { useEffect, useState } from 'react';
import './App.css';
import MainLayout from './views/layouts/MainLayout';
import BoardItem from 'components/BoardItem';
import { commentListMock, favoriteListMock, latestBoardListMock, top3BoardListMock } from 'mocks';
import Top3Item from 'components/Top3Item';
import CommentItem from 'components/CommentItem';
import FavoriteItem from 'components/FavoriteItem';
import InputBox from 'components/InputBox';
import Footer from 'layouts/Footer';
import { Route, Routes } from 'react-router-dom';
import Main from 'views/Main';
import Authentication from 'views/Authentication';
import Search from 'views/Search';
import UserP from 'views/User';
import BoardDetail from 'views/Board/Detail';
import BoardWrite from 'views/Board/Write';
import BoardUpdate from 'views/Board/Update';
import Container from 'layouts/Container';
import { MAIN_PATH, AUTH_PATH, SOCIAL_OAUTH_PATH, SEARCH_PATH, 
  USER_PATH, BOARD_PATH, BOARD_WRITE_PATH, BOARD_UPDATE_PATH, 
  BOARD_DETAIL_PATH, STORE_PATH, ITEM_PATH, ITEM_DETAIL_PATH,
  ITEM_UPDATE_PATH } from 'constant';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from 'stores';
import { GetSignInUserResponseDto } from 'apis/response/user';
import { ResponseDto } from 'apis/response';
import { User } from 'types/interface';
import { getSignInUserRequest } from 'apis';
import SocialSignUp from 'views/Authentication/SocialSignUp';
import Store from 'views/Store';
import Item from 'views/Item';
import ItemDetail from 'views/Item/Detail';
import ItemUpdate from 'views/Item/Update';

//          component: Application 컴포넌트         //
export default function App() {
  
  //          render: Application 컴포넌트 렌더링         //
  const { setLoginUser, resetLoginUser } = useLoginUserStore();

  const [cookies, setCookie] = useCookies();
  const [value, setValue] = useState<string>('');

  const getSignInUserResponse = (responseBody: GetSignInUserResponseDto | ResponseDto | null) => {
    if (!responseBody) return;
    const { code } = responseBody;
    if (code === 'AF' || code === 'NU' || code === 'DBE') {
      resetLoginUser();
      return;
    }
    const loginUser: User = { ...responseBody as GetSignInUserResponseDto };
    setLoginUser(loginUser);
  };

  useEffect(() => {
    if (!cookies.accessToken) {
      resetLoginUser();
      return;
    }
    getSignInUserRequest(cookies.accessToken).then(getSignInUserResponse);
  }, [cookies.accessToken]);

  return (
    <Routes>
      <Route element={<Container />}>
        <Route path={MAIN_PATH()} element={<Main />} />
        <Route path={AUTH_PATH()} element={<Authentication />} />
        <Route path={SOCIAL_OAUTH_PATH()} element={<SocialSignUp />} />
        <Route path={SEARCH_PATH(':searchWord')} element={<Search />} />
        <Route path={USER_PATH(':userEmail')} element={<UserP />} />
        <Route path={STORE_PATH()} element={<Store />} />
        <Route path={ITEM_PATH()} element={<Item />} />
        <Route path={ITEM_PATH()}>
          {/* <Route path={ITEM_WRITE_PATH()} element={<ItemWrite />} /> */}
          <Route path={ITEM_DETAIL_PATH(':itemId')} element={<ItemDetail />} />
          <Route path={ITEM_UPDATE_PATH(':itemId')} element={<ItemUpdate />} />
        </Route>
        <Route path={BOARD_PATH()}>
          <Route path={BOARD_WRITE_PATH()} element={<BoardWrite />} />
          <Route path={BOARD_DETAIL_PATH(':boardNumber')} element={<BoardDetail />} />
          <Route path={BOARD_UPDATE_PATH(':boardNumber')} element={<BoardUpdate />} />
        </Route>
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Route>
    </Routes>
    // <MainLayout />
    // <>
    //   <Footer />
    //   {/* <InputBox label='이메일' type='text' placeholder='이메일 주소를 입력해주세요.' value={value} error={true} setValue={setValue} message='aaa' /> */}
    //   {/* <div style={{ display: 'flex', columnGap: '30px', rowGap: '20px' }}>
    //     {favoriteListMock.map(favoriteListItem => <FavoriteItem favoriteListItem={favoriteListItem} />)}
    //   </div> */}
    //     {/* {commentListMock.map(commentListItem => <CommentItem commentListItem={commentListItem} />)} */}
    //   {/* <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
    //     {top3BoardListMock.map(top3ListItem => <Top3Item top3ListItem={top3ListItem} />)}
    //   </div> */}
    //   {/* { latestBoardListMock.map(boardListItem => <BoardItem boardListItem={boardListItem} />) } */}
    // </>
  );
}
