export default interface SignUpRequestDto {
    email: string;
    username: string;
    password: string;
    nickname: string;
    telNumber: string;
    address: string;
    addressDetail: string | null;
    agreedPersonal: boolean;
    provider: string | null;
};