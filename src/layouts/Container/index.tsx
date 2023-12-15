import React from 'react';
import Footer from 'layouts/Footer';
import Header from 'layouts/Header';
import { Outlet, useLocation } from 'react-router-dom';
import { AUTH_PATH } from 'constant';

export default function Container() {

  const { pathname } = useLocation(); // 현재 페이지를 알려줌.

  return (
    <>
      <Header />
      <Outlet />
      {pathname !== AUTH_PATH() && <Footer />}
    </>
  )
}
