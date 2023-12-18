import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import './style.css';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Box from '@mui/material/Box';
import InputBox from 'components/InputBox';
import { SignInRequestDto, SignUpRequestDto } from 'apis/request/auth';
import { signInRequest, signUpRequest } from 'apis';
import { SignInResponseDto, SignUpResponseDto } from 'apis/response/auth';
import { ResponseDto } from 'apis/response';
import { useCookies } from 'react-cookie';
import { MAIN_PATH, SOCIAL_OAUTH_PATH } from 'constant';
import { useNavigate } from 'react-router-dom';
import { Address, useDaumPostcodePopup } from 'react-daum-postcode';
import { useLoginUserStore } from 'stores';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import 'dotenv/config'

declare global {
  interface Window {
    naver: any;
    Kakao: any; // 꼭 맨앞K는 대문자여야함.
  }
}
const { naver, Kakao } = window;

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID

export default function Authentication() {

  const { loginUser, setLoginUser, resetLoginUser} = useLoginUserStore();
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [cookies, setCookie] = useCookies();
  const navigate = useNavigate();
  
  const SignInCard = () => {

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const [provider, setProvider] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');
    const [error, setError] = useState<boolean>(false);

    const NaverLoginInit = ((props: any) => {
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
        <>
          <div id='naverIdLogin' style={{display: 'block'}} />
          {/* <a className='naver-link' onClick={NaverLoginBtn} >
            <img className='naver-btn-image' />
          </a> */}
        </>
      )
  
    });
  
    const GoogleLoginBtn = (() => {
  
      const loginButtonOnClick = useGoogleLogin({
          // scope: "https://www.googleapis.com/auth/userinfo.profile ",
          onSuccess: async (tokenResponse:any) => {
              console.log(tokenResponse);
              if (tokenResponse) {
                const userInfo = await axios
                  .get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  })
                  .then(res => res.data);
                console.log('userInfo: ' + JSON.stringify(userInfo));
                if (userInfo) {
                  const provider:string = "GOOGLE";
                  const email:string = userInfo.email;
                  const nickname:string = userInfo.given_name;
                  const password:string = "";
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
                  console.log('userInfo null');
                }
              } else {
                console.log('tokenResponse null');
              }
          },
          onError: (error) => {
              console.log(error);
          },
      });
  
      return (
          <button className='googleBtn' onClick={() => loginButtonOnClick()} >
              <img src="https://www.svgrepo.com/show/355037/google.svg" height="20" />
              <span>구글 로그인</span>
          </button>
      );
  });
  
    const kakaoLoginHandler = () => {
      Kakao.Auth.authorize({
        // redirectUri: `${Redirect URI}`,
        redirectUri: process.env.REACT_APP_KAKAO_REDIRECT_URL,
      })
    }
  
    const getToken = async (code:string) => {
      console.log('code: ' + code);
      const grant_type = 'authorization_code';
      // const client_id = `${REST_API_KEY}`
      const client_id = process.env.REACT_APP_KAKAO_CLIENT_ID;
      const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URL;
  
      const res = await axios.post(
        // `https://kauth.kakao.com/oauth/token?grant_type=${grant_type}&client_id=${client_id}&redirect_uri=${REDIRECT_URI}&code=${AUTHORIZE_CODE}`,
        `https://kauth.kakao.com/oauth/token?grant_type=${grant_type}&client_id=${client_id}&redirect_uri=${REDIRECT_URI}&code=${code}`,
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      )
  
      console.log('res.data: ' + JSON.stringify(res.data));
      const token = res.data.access_token;
      const expirationTime = res.data.expires_in;
      console.log('token: ' + token);
      if(token) {
        Kakao.Auth.setAccessToken(token);
        Kakao.Auth.getStatusInfo()
          .then((res:any) => {
            if (res.status === 'connected') {
              console.log(Kakao.Auth.getAccessToken());
              Kakao.API.request({
                url: '/v2/user/me',
              })
                .then((response:any) => {
                  console.log('response: ' + JSON.stringify(response));
                  if (response) {
                    const provider:string = "KAKAO";
                    const email:string = response.kakao_account.email;
                    const nickname:string = response.properties.nickname;
                    const password:string = "";
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
                  }
                })
                .catch((err:any) => {
                  alert(
                    'failed to request user information: ' + JSON.stringify(err)
                  );
                });
            }
          })
          .catch(() => {
            Kakao.Auth.setAccessToken(null);
          });
      }
    }

    const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) => {
      if (!responseBody) {
        alert('네트워크 이상입니다.');
        return;
      }
      const { code } = responseBody;
      if (code === 'DBE') alert('데이터베이스 에러입니다.');
      if (code === 'SF' || code === 'VF') setError(true);
      if (code !== 'SU') return;

      const { token, expirationTime } = responseBody as SignInResponseDto;
      const now = new Date().getTime();
      const expires = new Date(now + expirationTime * 1000);

      setCookie('accessToken', token, { expires, path: MAIN_PATH( )});
      navigate(MAIN_PATH());
    };

    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setError(false);
      const { value } = event.target;
      setEmail(value);
    };

    const onPassowrdChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setError(false);
      const { value } = event.target;
      setPassword(value);
    };

    const onSignInButtonClickHandler = () => {
      const requestBody: SignInRequestDto = { provider, email, password };
      signInRequest(requestBody).then(signInResponse);
    };

    const onSignUpLinkClickHandler = () => {
      setView('sign-up');
    };

    const onPasswordButtonClickHandler = () => {
      if (passwordType === 'text') {
        setPasswordType('password');
        setPasswordButtonIcon('eye-light-off-icon');
      } else {
        setPasswordType('text');
        setPasswordButtonIcon('eye-light-on-icon');
      }
    };

    const onEmailKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!passwordRef.current) return; // 존재하지 않을시
      passwordRef.current.focus();  // 존재할시
    };

    const onPasswordKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onSignInButtonClickHandler();
    };

    useEffect(() => {
      // Kakao 로그인 초기화
      if (Kakao && !Kakao.isInitialized()) {
        // kakao.init(`${JavaScript 키}`)
        Kakao.init(process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY);
        console.log("kakako init: " + Kakao.isInitialized());
      }
      
      const params = new URL(document.location.toString()).searchParams;
      console.log('params: ' + params);
      const code = params.get('code');
      if (code) {
        getToken(code)
      }
      
    }, []);

    return (
      <div className='auth-card'>
        <div className='auth-card-box'>
          <div className='auth-card-top'>
            <div className='auth-card-title-box'>
              <div className='auth-card-title'>{'로그인'}</div>
            </div>
            <InputBox ref={emailRef} label='이메일 주소' type='text' placeholder='이메일 주소를 입력해주세요.' error={error} value={email} onChange={onEmailChangeHandler} onKeyDown={onEmailKeyDownHandler} />
            <InputBox ref={passwordRef} label='패스워드' type={passwordType} placeholder='비밀번호를 입력해주세요.' error={error} value={password} onChange={onPassowrdChangeHandler} onKeyDown={onPasswordKeyDownHandler} icon={passwordButtonIcon} onButtonClick={onPasswordButtonClickHandler} />
          </div>
          <div className='auth-card-bottom'>
            {error &&
              <div className='auth-sign-in-error-box'>
                <div className='auth-sign-in-error-message'>
                  {'이메일 주소 또는 비밀번호를 잘못 입력했습니다. \n입력하신 내용을 다시 확인해주세요.'}
                </div>
              </div>
            }
            <div className='black-large-full-button' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
            <NaverLoginInit />
              <a id='kakao-login-btn' onClick={kakaoLoginHandler}>
                <img src="https://k.kakaocdn.net/14/dn/btroDszwNrM/I6efHub1SN5KCJqLm1Ovx1/o.jpg" width="200" height="50"
                  alt="카카오 로그인 버튼" />
              </a>
            <GoogleOAuthProvider clientId={googleClientId || ''}>
                <GoogleLoginBtn />
            </GoogleOAuthProvider>
            <div className='auth-description-box'>
              <div className='auth-description'>
                {'신규 사용자이신가요? '}<span className='auth-description-link' onClick={onSignUpLinkClickHandler}>{'회원가입'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  };

  const SignUpCard = () => {

    const emailRef = useRef<HTMLInputElement | null>(null);
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const passwordCheckRef = useRef<HTMLInputElement | null>(null);
    const nicknameRef = useRef<HTMLInputElement | null>(null);
    const telNumberRef = useRef<HTMLInputElement | null>(null);
    const addressRef = useRef<HTMLInputElement | null>(null);
    const addressDetailRef = useRef<HTMLInputElement | null>(null);
    
    const [page, setPage] = useState<1 | 2>(1);
    const [provider, setProvider] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordCheck, setPasswordCheck] = useState<string>('');
    const [nickname, setNickname] = useState<string>('');
    const [telNumber, setTelNumber] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [addressDetail, setAddressDetail] = useState<string>('');
    const [agreedPersonal, setAgreedPersonal] = useState<boolean>(false);

    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    const [passwordCheckType, setPasswordCheckType] = useState<'text' | 'password'>('password');

    const [isEmailError, setEmailError] = useState<boolean>(false);
    const [isUsernameError, setUsernameError] = useState<boolean>(false);
    const [isPasswordError, setPasswordError] = useState<boolean>(false);
    const [isPasswordCheckError, setPasswordCheckError] = useState<boolean>(false);
    const [isNicknameError, setNicknameError] = useState<boolean>(false);
    const [isTelNumberError, setTelNumberError] = useState<boolean>(false);
    const [isAddressError, setAddressError] = useState<boolean>(false);
    const [isAgreedPersonalError, setAgreedPersonalError] = useState<boolean>(false);

    const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
    const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
    const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] = useState<string>('');
    const [nicknameErrorMessage, setNicknameErrorMessage] = useState<string>('');
    const [telNumberErrorMessage, setTelNumberErrorMessage] = useState<string>('');
    const [addressErrorMessage, setAddressErrorMessage] = useState<string>('');
    
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');
    const [passwordCheckButtonIcon, setPasswordCheckButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');

    const open = useDaumPostcodePopup();

    const signUpResponse = (responseBody: SignUpResponseDto | ResponseDto | null) => {
      if (!responseBody) {
        alert('네트워크 이상입니다.');
        return;
      }
      const { code } = responseBody;
      if (code === 'DE') {
        setEmailError(true);
        setEmailErrorMessage('중복되는 이메일 주소입니다.');
      }
      if (code === 'DN') {
        setNicknameError(true);
        setNicknameErrorMessage('중복되는 닉네임입니다.');
      }
      if (code === 'DT') {
        setTelNumberError(true);
        setTelNumberErrorMessage('중복되는 핸드폰 번호입니다.');
      }
      if (code === 'VF') alert('모든 값을 입력하세요.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');

      if (code !== 'SU') return;

      setView('sign-in');
    };

    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setEmail(value);
      setEmailError(false);
      setEmailErrorMessage('');
    };

    const onUsernameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setUsername(value);
      setUsernameError(false);
      setUsernameErrorMessage('');
    };

    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPassword(value);
      setPasswordError(false);
      setPasswordErrorMessage('');
    };

    const onPasswordCheckChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPasswordCheck(value);
      setPasswordCheckError(false);
      setPasswordCheckErrorMessage('');
    };

    const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setNickname(value);
      setNicknameError(false);
      setNicknameErrorMessage('');
    };

    const onTelNumberChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setTelNumber(value);
      setTelNumberError(false);
      setTelNumberErrorMessage('');
    };

    const onAddressChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setAddress(value);
      setAddressError(false);
      setAddressErrorMessage('');
    };

    const onAddressDetailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setAddressDetail(value);
    };

    const onAgreedPersonalClickHandler = () => {
      setAgreedPersonal(!agreedPersonal);
      setAgreedPersonalError(false);
    };

    const onPasswordButtonClickHandler = () => {
      if (passwordButtonIcon === 'eye-light-off-icon') {
        setPasswordButtonIcon('eye-light-on-icon');
        setPasswordType('text');
      } else {
        setPasswordButtonIcon('eye-light-off-icon');
        setPasswordType('password');
      }
    };

    const onPasswordCheckButtonClickHandler = () => {
      if (passwordCheckButtonIcon === 'eye-light-off-icon') {
        setPasswordCheckButtonIcon('eye-light-on-icon');
        setPasswordCheckType('text');
      } else {
        setPasswordCheckButtonIcon('eye-light-off-icon');
        setPasswordCheckType('password');
      }
    };

    const onAddressButtonClickHandler = () => {
      open({ onComplete });
    };

    const onNextButtonClickHandler = () => {
      const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
      const isEmailPattern = emailPattern.test(email);
      if (!email) {
        setEmailError(true);
        setEmailErrorMessage('이메일 주소 포멧이 맞지 않습니다.')
      }

      const hasUsername = username.trim().length !== 0;
      if (!hasUsername) {
        setUsernameError(true);
        setUsernameErrorMessage('이름을 입력해주세요.');
      }

      const isCheckPassword = password.trim().length >= 8;
      if (!isCheckPassword) {
        setPasswordError(true);
        setPasswordErrorMessage('비밀번호는 8자 이상 입력해주세요.');
      }

      const isEqualPassword = password == passwordCheck;
      if (!isEqualPassword) {
        setPasswordCheckError(true);
        setPasswordCheckErrorMessage('비밀번호가 일치하지않습니다.');
      }
      
      if (!isEmailPattern || !hasUsername || !isCheckPassword || !isEqualPassword) return;
      setPage(2);
    };

    const onSignUpButtonClickHandler = () => {
      const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
      const isEmailPattern = emailPattern.test(email);
      if (!email) {
        setEmailError(true);
        setEmailErrorMessage('이메일 주소 포멧이 맞지 않습니다.')
      }

      const hasUsername = username.trim().length !== 0;
      if (!hasUsername) {
        setUsernameError(true);
        setUsernameErrorMessage('이름을 입력해주세요.');
      }

      const isCheckPassword = password.trim().length >= 8;
      if (!isCheckPassword) {
        setPasswordError(true);
        setPasswordErrorMessage('비밀번호는 8자 이상 입력해주세요.');
      }
      const isEqualPassword = password == passwordCheck;
      if (!isEqualPassword) {
        setPasswordCheckError(true);
        setPasswordCheckErrorMessage('비밀번호가 일치하지않습니다.');
      }
      if (!isEmailPattern || !hasUsername || !isCheckPassword || !isEqualPassword) {
        setPage(1);
        return;
      }

      const hasNickname = nickname.trim().length !== 0;
      if (!hasNickname) {
        setNicknameError(true);
        setNicknameErrorMessage('닉네임을 입력해주세요.');
      }

      const telNumberPattern = /^[0-9]{11,13}$/;
      const isTelNumberPattern = telNumberPattern.test(telNumber);
      if (!isTelNumberPattern) {
        setTelNumberError(true);
        setTelNumberErrorMessage('숫자만 입력해주세요.');
      }
      
      const hasAddress = address.trim().length > 0;
      if (!hasAddress) {
        setAddressError(true);
        setAddressErrorMessage('주소를 입력해주세요.');
      }

      if (!agreedPersonal) setAgreedPersonalError(true);

      if (!hasNickname || !isTelNumberPattern || !agreedPersonal) return;

      const requestBody: SignUpRequestDto = {
        provider, email, username, password, nickname, telNumber, address, addressDetail, agreedPersonal
      };
      signUpRequest(requestBody).then(signUpResponse)
    };

    const onSignInLinkClickHandler = () => {
      setView('sign-in');
    };

    const onEmailKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!usernameRef.current) return;
      usernameRef.current.focus();
    };

    const onUsernameKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!passwordRef.current) return;
      passwordRef.current.focus();
    };

    const onPasswordKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!passwordCheckRef.current) return;
      passwordCheckRef.current.focus();
    };
    
    const onPasswordCheckKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onNextButtonClickHandler();
    };

    const onNicknameKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!telNumberRef.current) return;
      telNumberRef.current.focus();
    };

    const onTelNumberKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onAddressButtonClickHandler();
    };

    const onAddressKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!addressDetailRef.current) return;
      addressDetailRef.current.focus();
    };

    const onAddressDetailKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onSignUpButtonClickHandler();
    };

    // 다음 주소 검색 완료 이벤트 처리
    const onComplete = (data: Address) => {
      const { address } = data;
      setAddress(address);
      setAddressError(false);
      setAddressErrorMessage('');
      if (!addressDetailRef.current) return;
      addressDetailRef.current.focus();
    };
    
    // 페이지가 변경될 때 마다 실행될 함수
    useEffect(() => {
      if (page === 2) {
        if (!nicknameRef.current) return;
        nicknameRef.current.focus();
      }
    }, [page]);

    return (
      <div className='auth-card'>
        <div className='auth-card-box'>
          <div className='auth-card-top'>
            <div className='auth-card-title-box'>
              <div className='auth-card-title'>{'회원가입'}</div>
              <div className='auth-card-page'>{`${page}/2`}</div>
            </div>
            {page === 1 && (
              <>
                <InputBox ref={emailRef} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' value={email} onChange={onEmailChangeHandler} error={isEmailError} message={emailErrorMessage} onKeyDown={onEmailKeyDownHandler} />
                <InputBox ref={usernameRef} label='이름*' type='text' placeholder='이름을 입력해주세요.' value={username} onChange={onUsernameChangeHandler} error={isUsernameError} message={usernameErrorMessage} onKeyDown={onUsernameKeyDownHandler} />
                <InputBox ref={passwordRef} label='비밀번호*' type={passwordType} placeholder='비밀번호를 입력해주세요.' value={password} onChange={onPasswordChangeHandler} error={isPasswordError} message={passwordErrorMessage} icon={passwordButtonIcon} onButtonClick={onPasswordButtonClickHandler} onKeyDown={onPasswordKeyDownHandler} />
                <InputBox ref={passwordCheckRef} label='비밀번호 확인*' type={passwordCheckType} placeholder='비밀번호를 다시 입력해주세요.' value={passwordCheck} onChange={onPasswordCheckChangeHandler} error={isPasswordCheckError} message={passwordCheckErrorMessage} icon={passwordCheckButtonIcon} onButtonClick={onPasswordCheckButtonClickHandler} onKeyDown={onPasswordCheckKeyDownHandler} />
              </>
            )}
            {page === 2 && (
              <>
                <InputBox ref={nicknameRef} label='닉네임*' type='text' placeholder='닉네임을 입력해주세요.' value={nickname} onChange={onNicknameChangeHandler} error={isNicknameError} message={nicknameErrorMessage} onKeyDown={onNicknameKeyDownHandler} />
                <InputBox ref={telNumberRef} label='핸드폰 번호*' type='text' placeholder='핸드폰 번호를 입력해주세요.' value={telNumber} onChange={onTelNumberChangeHandler} error={isTelNumberError} message={telNumberErrorMessage} onKeyDown={onTelNumberKeyDownHandler} />
                <InputBox ref={addressRef} label='주소*' type='text' placeholder='우편번호 찾기' value={address} onChange={onAddressChangeHandler} error={isAddressError} message={addressErrorMessage} icon='expand-right-light-icon' onButtonClick={onAddressButtonClickHandler} onKeyDown={onAddressKeyDownHandler} />
                <InputBox ref={addressDetailRef} label='상세 주소' type='text' placeholder='상세 주소를 입력해주세요.' value={addressDetail} onChange={onAddressDetailChangeHandler} error={false} onKeyDown={onAddressDetailKeyDownHandler} />
              </>
            )}
          </div>
          <div className='auth-card-bottom'>
            {page === 1 && (
              <div className='black-large-full-button' onClick={onNextButtonClickHandler}>{'다음 단계'}</div>
              )}
            {page === 2 && (
              <>
                <div className='auth-consent-box'>
                  <div className='auth-check-box' onClick={onAgreedPersonalClickHandler}>
                    <div className={`icon ${agreedPersonal ? 'check-round-fill-icon' : 'check-ring-light-icon'}`}></div>
                  </div>
                  <div className={isAgreedPersonalError ? 'auth-consent-title-error' : 'auth-consent-title'}>{'개인정보동의'}</div>
                  <div className='auth-consent-link'>{'더보기 >'}</div>
                </div>
                <div className='black-large-full-button' onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
              </>
            )}
            <div className='auth-description-box'>
              <div className='auth-description'>{'이미 계정이 있으신가요?'}
                <span className='auth-description-link' onClick={onSignInLinkClickHandler}>{'로그인'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // authView : true - signUp / false - signIn
  const [authView, setAuthView] = useState<boolean>(false);
  
  return (
    // <>
    //   <Box display='flex' height='100vh'>
    //       <Box flex={1} display='flex' justifyContent='center' alignItems='center'></Box>
    //       <Box flex={1} display='flex' justifyContent='center' alignItems='center'>
    //         { authView ? (<SignUp setAuthView={setAuthView} />) : (<SignIn setAuthView={setAuthView} />) }
    //       </Box>
    //   </Box>
    // </>
    <div id='auth-wrapper'>
      <div className='auth-container'>
        <div className='auth-jumbotron-box'>
          <div className='auth-jumbotron-contents'>
            <div className='auth-logo-icon'></div>
            <div className='auth-jumbotron-text-box'>
              <div className='auth-jumbotron-text'>{'환영합니다.'}</div>
              <div className='auth-jumbotron-text'>{'SOONJONGNIM BOARD 입니다.'}</div>
            </div>
          </div>
        </div>
        {view === 'sign-in' && <SignInCard />}
        {view === 'sign-up' && <SignUpCard />}
      </div>
    </div>
  )
}
