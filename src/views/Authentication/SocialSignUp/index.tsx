import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import './style.css';
import InputBox from 'components/InputBox';
import { SignInRequestDto, SignUpRequestDto } from 'apis/request/auth';
import { signInRequest, signUpRequest, socialOauthRequest } from 'apis';
import { SignInResponseDto, SignUpResponseDto } from 'apis/response/auth';
import { ResponseDto } from 'apis/response';
import { useCookies } from 'react-cookie';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Address, useDaumPostcodePopup } from 'react-daum-postcode';
import { MAIN_PATH } from 'constant';
import { useLoginUserStore } from 'stores';

export default function SocialSignUp() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, setLoginUser, resetLoginUser} = useLoginUserStore();
  const [cookies, setCookie] = useCookies();
  
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');
  const emailRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  const telNumberRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const addressDetailRef = useRef<HTMLInputElement | null>(null);
  
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [telNumber, setTelNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [addressDetail, setAddressDetail] = useState<string>('');
  const [agreedPersonal, setAgreedPersonal] = useState<boolean>(false);
  const [provider, setProvider] = useState<string>('');


  const [isEmailError, setEmailError] = useState<boolean>(false);
  const [isUsernameError, setUsernameError] = useState<boolean>(false);
  const [isNicknameError, setNicknameError] = useState<boolean>(false);
  const [isTelNumberError, setTelNumberError] = useState<boolean>(false);
  const [isAddressError, setAddressError] = useState<boolean>(false);
  const [isAgreedPersonalError, setAgreedPersonalError] = useState<boolean>(false);

  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
  const [usernameErrorMessage, setUsernameErrorMessage] = useState<string>('');
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState<string>('');
  const [telNumberErrorMessage, setTelNumberErrorMessage] = useState<string>('');
  const [addressErrorMessage, setAddressErrorMessage] = useState<string>('');
  

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

  const onAddressButtonClickHandler = () => {
    open({ onComplete });
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

    if (!hasUsername || !hasNickname || !isTelNumberPattern || !hasAddress || !agreedPersonal) return;

    const requestBody: SignUpRequestDto = {
      'email': email,
      'password': "",
      'username': username,
      'nickname': nickname,
      'telNumber': telNumber,
      'address': address,
      'addressDetail': addressDetail,
      'agreedPersonal': agreedPersonal,
      'provider': provider,
    }
    // socialOauthRequest(requestBody).then(signUpResponse)
    socialOauthRequest(requestBody).then(result => {
      console.log("result:" , result); // 성공 시 호출된 콜백에서 반환된 값
      if (result) {
        const now = new Date().getTime();
        const expires = new Date(now + result.expirationTime * 1000);
        const user = {
          'email': email,
          'nickname': nickname,
          'profileImage': null,
        }
        setLoginUser(user);
        setCookie('accessToken', result.token, { expires, path: MAIN_PATH()});
        navigate(MAIN_PATH());
      }
    }).catch(error => {
      console.error(error); // 실패 시 호출된 콜백에서 반환된 값
    });
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
    if (!nicknameRef.current) return;
    nicknameRef.current.focus();
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
    const stateData = location.state;
    console.log('stateData: ' + JSON.stringify(stateData));
    const { param_provider, param_email, param_nickname  } = stateData;
    console.log(param_provider, param_email, param_nickname)
    setProvider(param_provider);
    setEmail(param_email);
    setNickname(param_nickname);
  }, []);

  return (
    <div className='auth-card'>
      <div className='auth-card-box'>
        <div className='auth-card-top'>
          <div className='auth-card-title-box'>
            <div className='auth-card-title'>{'쇼셜회원가입'}</div>
          </div>
            <InputBox ref={emailRef} label='이메일 주소*' type='text' placeholder='이메일 주소를 입력해주세요.' value={email} onChange={onEmailChangeHandler} error={isEmailError} message={emailErrorMessage} onKeyDown={onEmailKeyDownHandler} readOnly={true} />
            <InputBox ref={usernameRef} label='이름*' type='text' placeholder='이름을 입력해주세요.' value={username} onChange={onUsernameChangeHandler} error={isUsernameError} message={usernameErrorMessage} onKeyDown={onUsernameKeyDownHandler} />
            <InputBox ref={nicknameRef} label='닉네임*' type='text' placeholder='닉네임을 입력해주세요.' value={nickname} onChange={onNicknameChangeHandler} error={isNicknameError} message={nicknameErrorMessage} onKeyDown={onNicknameKeyDownHandler} readOnly={true} />
            <InputBox ref={telNumberRef} label='핸드폰 번호*' type='text' placeholder='핸드폰 번호를 입력해주세요.' value={telNumber} onChange={onTelNumberChangeHandler} error={isTelNumberError} message={telNumberErrorMessage} onKeyDown={onTelNumberKeyDownHandler} />
            <InputBox ref={addressRef} label='주소*' type='text' placeholder='우편번호 찾기' value={address} onChange={onAddressChangeHandler} error={isAddressError} message={addressErrorMessage} icon='expand-right-light-icon' onButtonClick={onAddressButtonClickHandler} onKeyDown={onAddressKeyDownHandler} />
            <InputBox ref={addressDetailRef} label='상세 주소' type='text' placeholder='상세 주소를 입력해주세요.' value={addressDetail} onChange={onAddressDetailChangeHandler} error={false} onKeyDown={onAddressDetailKeyDownHandler} />
        </div>
        <div className='auth-card-bottom'>
          <div className='auth-consent-box'>
            <div className='auth-check-box' onClick={onAgreedPersonalClickHandler}>
              <div className={`icon ${agreedPersonal ? 'check-round-fill-icon' : 'check-ring-light-icon'}`}></div>
            </div>
            <div className={isAgreedPersonalError ? 'auth-consent-title-error' : 'auth-consent-title'}>{'개인정보동의'}</div>
            <div className='auth-consent-link'>{'더보기 >'}</div>
          </div>
          <div className='black-large-full-button' onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
          <div className='auth-description-box'>
            <div className='auth-description'>{'이미 계정이 있으신가요?'}
              <span className='auth-description-link' onClick={onSignInLinkClickHandler}>{'로그인'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
