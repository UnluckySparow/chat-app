import React from 'react'
import './userinfo.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut,faVideo } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../../lib/userStore';
import { auth } from '../../lib/firebase';

export default function Userinfo() {
  const {currentUser}= useUserStore()
  const handleSignout = (e) =>{
    e.preventDefault();
    auth.signOut();
  }
  return (
    <div className='UserInfo'>
      <div className='user'>
      <img src={currentUser.avatar || "/images/avatar.png"} alt="" />

        <h2>
          {currentUser.username}
        </h2>
      </div>
      <div className='icons'>
        <FontAwesomeIcon className="video" icon={faVideo} />
        {/* <FontAwesomeIcon className="edit" icon={faEdit} /> */}
        <FontAwesomeIcon className="more" icon={faSignOut} onClick={handleSignout} />
      </div>
    </div>
  )
}
