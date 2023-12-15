import React, { useEffect, useState } from 'react'
import Navigation from '../../Navigation'
import Authentication from '../../Authentication'
import BoardMain from '../../BoardMain'
import { useLoginUserStore } from '../../../stores'
import Cookie from 'react-cookies'


export default function MainLayout() {
  const { loginUser } = useLoginUserStore();

  const token = Cookie.load('token'); // 복잡한 표현식을 변수로 저장

  return (
    <>
      <Navigation />
      {loginUser ? (<BoardMain token={token} />) : (<Authentication />)}
    </>
  )
}
