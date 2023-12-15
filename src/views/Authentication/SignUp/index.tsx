import React, { useState } from 'react'

import {
    Card,
    TextField,
    Button,
    Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { signUpApi } from '../../../apis';

interface Props {
    setAuthView: (setAuthView: boolean) => void,
}

export default function SignUp(props: Props) {
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordCheck, setPasswordCheck] = useState<string>('');
    const [nickname, setNickname] = useState<string>('');
    const [telNumber, setTelNumber] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [addressDetail, setAddressDetail] = useState<string>('');
    // const [agreedPersonal, setAgreedPersonal] = useState<string>('');

    const { setAuthView } = props;

    const signUpHandler = async () => {
        const data = {
            email,
            username,
            password,
            passwordCheck,
            nickname,
            telNumber,
            address,
            addressDetail,
            // agreedPersonal,
        };

        const signUpResponse = await signUpApi(data);
        console.log('signUpResponse: ' + JSON.stringify(signUpResponse));
        console.log('signUpResponse.result: ' + signUpResponse.result);

        if (!signUpResponse) { 
            alert('회원가입에 실패했습니다.');  
            return; 
        };

        if (!signUpResponse.result) { 
            alert('회원가입에 실패했습니다.');  
            return; 
        };
        
        alert('회원가입에 성공했습니다.');
        setAuthView(false);
    };
  return (
    <Card sx={{ minWidth: 275, maxWidth: "50vw", padding: 5 }}>
        <Box>
            <Typography variant='h5'>회원가입</Typography>
        </Box>
        <Box height='50vh'>
            <TextField fullWidth label="이메일 주소" type="email" variant="standard" onChange={(e) => setEmail(e.target.value)} />
            <TextField fullWidth label="이름" type="username" variant="standard" onChange={(e) => setUsername(e.target.value)} />
            <TextField fullWidth label="비밀번호" type="password" variant="standard" onChange={(e) => setPassword(e.target.value)} />
            <TextField fullWidth label="비밀번호 확인" type="password" variant="standard" onChange={(e) => setPasswordCheck(e.target.value)} />
            <TextField fullWidth label="닉네임" variant="standard" onChange={(e) => setNickname(e.target.value)} />
            <TextField fullWidth label="휴대폰 번호" variant="standard" onChange={(e) => setTelNumber(e.target.value)} />
            <TextField fullWidth label="주소" variant="standard" onChange={(e) => setAddress(e.target.value)} />
            <TextField fullWidth label="상세주소" variant="standard" onChange={(e) => setAddressDetail(e.target.value)} />
        </Box>
        <Box component='div'>
            <Button fullWidth onClick={() => signUpHandler()} variant="contained">회원가입</Button>
        </Box>
        <Box component='div' display='flex' mt={2}>
            <Typography>이미 계정이 있으신가요?</Typography>
            <Typography fontWeight={800} ml={1} onClick={() => setAuthView(false)}>로그인</Typography>
        </Box>
    </Card>
  )
}
