import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*
enter a product name and quantity, to issue token, mint that many, and post for 
sale all in one step (also approval) 
- if you aren't approved as a seller, you can't 

buy: choose one to buy and buy that one 
- you can't buy your own thing 

collect: colllect your loot 
- can't collect on your own thing 
*/

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
