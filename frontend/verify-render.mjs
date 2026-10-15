import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {default:App}=await server.ssrLoadModule('/src/App.jsx');
 for(const role of ['ADMIN','STAFF']){
  const html=renderToString(React.createElement(App,{user:{id:1,name:'Test User',role},onLogout:()=>{},onPasswordChanged:()=>{}}));
  if(!html.includes('People Flow Employee Management System'))throw Error('Missing brand');
  if(role==='STAFF'&&(html.includes('>Add employee<')||html.includes('>Accounts<')))throw Error('Staff write controls');
  if(role==='ADMIN'&&!html.includes('>Accounts<'))throw Error('Missing admin accounts');
  console.log(role+' render passed');
 }
}finally{await server.close();}
