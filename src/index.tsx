import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // 여러번 호출 문제!!
  //StrictMode의 이점 ( side effect 예방, 코드 검사 ) 등을 포기하고 지금 당장의 이슈를 해결하고 싶다면
  // 간단하게 <App />을 감싸고 있는 <React.StrictMode>를 제거하면 된다.
 
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
