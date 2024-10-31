import React, { useEffect } from 'react';
import './App.css';
import Chat from './Component/chat/Chat';
import List from './Component/list/list';
import Login from './Component/login/Login';
import Notification from './Component/notification/Notification';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Component/lib/firebase';
import { useUserStore } from './Component/lib/userStore';
import { useChatStore } from './Component/lib/useChatStore';
// import Details from './Component/details/details';
import Det from './Component/det/Det';


function App() {
  const {currentUser,isLoading,fetchUserInfo}= useUserStore()
  const {chatId} = useChatStore()
  useEffect(()=>{
    const unSub = onAuthStateChanged(auth,(user)=>{
      fetchUserInfo(user?.uid)
      ;})
      return()=>{
        unSub()
      };
  },[fetchUserInfo])
  if(isLoading){
    return <div className='loading'>Loading ... </div>
  }
  return (
   <div className="container">
    {
      currentUser ? (
        // if user logeed (true)
        <>
        <List />
        {chatId && <Chat />}
        {/* {chatId && <Details />} */}
        {chatId &&  <Det />}
          
        </>
        
      ) : 
      // if user not logeed (false)
      (<Login />) 
    }
      <Notification />
   </div>
  );
}

export default App;
