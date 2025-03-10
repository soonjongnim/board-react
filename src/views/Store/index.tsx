import React, { useEffect, useState } from 'react';
import './style.css';
import axios from 'axios';
import { useLoginUserStore } from 'stores';

const DOMAIN = process.env.NEXT_PUBLIC_API_BACKEND_URL;

declare global {
    interface Window {
      IMP: any;
    }
}

const Payment = () => {

    const { loginUser } = useLoginUserStore();
    const [isLogin, setLogin] = useState<boolean>(false);

    const email = loginUser?.email;
    console.log('email: ' + JSON.stringify(email))

  useEffect(() => {
    const jquery = document.createElement("script");
    jquery.src = "http://code.jquery.com/jquery-1.12.4.min.js";
    const iamport = document.createElement("script");
    iamport.src = "http://cdn.iamport.kr/js/iamport.payment-1.1.7.js";
    document.head.appendChild(jquery);
    document.head.appendChild(iamport);

    // if (!loginUser) return;
    // const { email } = loginUser;
    

    return () => {
      document.head.removeChild(jquery);
      document.head.removeChild(iamport);
    };
  }, []);

  const requestPay = () => {

    // 로그인 체크
    if (!loginUser) {
        alert("로그인 후 이용할 수 있습니다.");
        return;
    }

    const { IMP } = window;
    IMP.init('imp86950097'); // 가맹점 식별코드

    const today = new Date();
    const hours = today.getHours(); // 시
    const minutes = today.getMinutes();  // 분
    const seconds = today.getSeconds();  // 초
    const milliseconds = today.getMilliseconds();
    const makeMerchantUid = `${hours}` + `${minutes}` + `${seconds}` + `${milliseconds}`;

    IMP.request_pay({
    //   pg: '{PG사코드}.{PG상점ID}', // PG사 코드표에서 선택
      pg: 'html5_inicis.INIpayTest', // PG사 코드표에서 선택
      pay_method: 'card', // 결제 방식
      merchant_uid: "IMP" + makeMerchantUid, // 결제 고유 번호
      name: '테스트 상품', // 제품명
      amount: 1004, // 가격
      //구매자 정보 ↓
      buyer_email: 'test@naver.com',
      buyer_name: '코드쿡',
      buyer_tel: '010-1234-5678',
      buyer_addr: '서울특별시',
      buyer_postcode: '123-456',
    }, async (rsp:any) => {
      try {
        console.log('rsp: ' + JSON.stringify(rsp));
        if (rsp.success) { // 결제 성공
            const data = {
                imp_uid: rsp.imp_uid,
                merchant_uid: rsp.merchant_uid,
                pay_auth_id : rsp.pay_auth_id,
                goods_id : rsp.goods_id,
                user_email: email,
            }
            const response:any = await axios.post(`${DOMAIN}/api/payment/verifyIamport`, data);
            console.log('response: ' + JSON.stringify(response));
            // if (rsp.paid_amount === data.response.amount) {
            //   alert('결제 완료!');
            // } else {
            //   alert('결제완료 후 DB저장 실패시');
            // }
            if(response.data.code === 'SU'){
                //결제성공(웹서버측 성공)
                alert("결제에 성공했습니다.");
            }else{
                //결제실패(웹서버측 실패)   
                // 환불 코드(아직 구현 안함)
                alert("결제에 실패했습니다.");  
                // removePayAuth(pay_auth_id);// pay_auth 값 지우기
            }

        } else {
            // removePayAuth(pay_auth_id); // pay_auth 값 지우기
            alert("결제에 실패했습니다. : " +  rsp.error_msg);
        }
      } catch (error) {
        console.error('Error while verifying payment:', error);
        alert('결제 실패');
      }
    });
  };

//   if (loginUser)
  // true일 경우
  return (
    <div>
        <button className="kakaopay_btn" onClick={requestPay}>
            <i className="fa fa-credit-card" style={{ fontSize:'none' }}></i> 결제하기
        </button>
    </div>
  );

  // false일 경우
//   return (
//     <div>
//       로그인 후 결제 가능
//     </div>
//   );
};

export default Payment;