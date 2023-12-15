import axios from "axios";
import { SignInRequestDto, SignUpRequestDto } from "./request/auth";
import { SignInResponseDto, SignUpResponseDto } from "./response/auth";
import { ResponseDto } from "./response";
import { GetSignInUserResponseDto } from "./response/user";

const DOMAIN = 'http://158.180.74.125:4000';
const API_DOMAIN = `${DOMAIN}/api`;

const authorization = (accessToken: string) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } };
};

const SIGN_IN_URL = () => `${API_DOMAIN}/auth/signIn`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/signUp`;
const SIGN_SOCIAL_OAUTH_URL = () => `${API_DOMAIN}/auth/socialOauth`;

export const socialOauthRequest = async (data:any) => {
    const result = await axios.post(SIGN_SOCIAL_OAUTH_URL(), data)
        .then(response => {
            // console.log('response: ' + JSON.stringify(response));
            const responseBody = response.data;
            // console.log('responseBody: ' + JSON.stringify(responseBody));
            return responseBody;
        })
        .catch((error) => {
            if (!error.response.data) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    console.log('result: ' + JSON.stringify(result))
    return result;
};

export const signInRequest = async (requestBody: SignInRequestDto) => {
    const result = await axios.post(SIGN_IN_URL(), requestBody)
        .then(response => {
            const responseBody: SignInResponseDto = response.data;
            return responseBody;
        })
        .catch((error) => {
            if (!error.response.data) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    return result;
};

export const signUpRequest = async (requestBody: SignUpRequestDto) => {
    const result = await axios.post(SIGN_UP_URL(), requestBody)
        .then(response => {
            const responseBody: SignUpResponseDto = response.data;
            return responseBody;
        })
        .catch((error) => {
            if (!error.response.data) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    return result;
};

const GET_SIGN_IN_USER_URL = () => `${API_DOMAIN}/user`;

export const getSignInUserRequest = async (accessToken: string) => {
    const result = await axios.get(GET_SIGN_IN_USER_URL(), authorization(accessToken))
        .then(response => {
            const responseBody: GetSignInUserResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    return result;
};

export const signInApi = async (data: any) => {
    const response = await axios.post(SIGN_IN_URL(), data).catch((error) => null);
    if (!response) return null;
    const result = response.data;

    return result;
};

export const signUpApi = async (data: any) => {
    const response = await axios.post(SIGN_UP_URL(), data).catch((error) => null);
    if (!response) return null;
    const result = response.data;

    return result;
};