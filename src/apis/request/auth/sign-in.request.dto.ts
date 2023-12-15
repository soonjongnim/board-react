export default interface SignInRequestDto {
    provider: string;
    email: string;
    password: string | null;
}