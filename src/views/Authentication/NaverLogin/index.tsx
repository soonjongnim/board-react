import { signInRequest } from 'apis';
import { SignInRequestDto } from 'apis/request/auth';
import { MAIN_PATH, SOCIAL_OAUTH_PATH } from 'constant';
import React, { useEffect } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useLoginUserStore } from 'stores';

declare global {
    interface Window {
      naver: any;
    }
  }

const { naver } = window;

export default function NaverLogin() {

    const { loginUser, setLoginUser, resetLoginUser} = useLoginUserStore();
    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();

    const initializeNaverLogin = () => {
        const naverLogin = new naver.LoginWithNaverId({
          clientId: process.env.REACT_APP_NAVER_CLIENT_ID,
          callbackUrl: process.env.REACT_APP_NAVER_CALLBACK_URL,
          isPopup: false, // popup 형식으로 띄울것인지 설정
          loginButton: { color: 'grren', type: 3, height: '50' }, //버튼의 스타일, 타입, 크기를 지정
        });
        naverLogin.init();
      };
  
      const NaverLoginBtn = (() => {
        // 네이버 로그인 초기화
        const naverLogin = new naver.LoginWithNaverId({
          clientId: process.env.REACT_APP_NAVER_CLIENT_ID,
          });
          
        // naverLogin.init();
        naverLogin.getLoginStatus((status:boolean) => {
          // console.log('naverLogin: ' + JSON.stringify(naverLogin));
          if (status) {
            const provider:string = "NAVER";
            const email:string = naverLogin.user.getEmail();
            const username:string = naverLogin.user.getName();
            const nickname:string = naverLogin.user.getNickName();
            const mobile:string = naverLogin.user.getMobile();
            const password:string = "";
            // const naverId = naverLogin.user.getId();
            const data = {
              'param_provider': provider,
              'param_email': email,
              'param_nickname': nickname,
            };
            const requestBody: SignInRequestDto = { provider, email, password };
            signInRequest(requestBody)
              .then((responseBody: any) => {
                console.log('responseBody: ' + JSON.stringify(responseBody));
                if (responseBody.code === 'SU') {
                  const now = new Date().getTime();
                  const expires = new Date(now + responseBody.expirationTime * 1000);
                  const user = {
                    'email': email,
                    'nickname': nickname,
                    'profileImage': null,
                  }
                  setCookie('accessToken', responseBody.token, { expires, path: MAIN_PATH()});
                  setLoginUser(user);
                  navigate(MAIN_PATH());
                } else {
                  navigate(SOCIAL_OAUTH_PATH(), { state: data });
                }
              })
              .catch(error => {
                console.error(error); // 실패 시 호출된 콜백에서 반환된 값
              });
          } else {
            console.log("AccessToken이 올바르지 않습니다.");
          }
        });
      });
    
      useEffect(() => {
        initializeNaverLogin();
        NaverLoginBtn();
      }, []);
    
      return (
          <div id='naverIdLogin' style={{display: 'block'}} />
      )
}
