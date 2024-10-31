import React from 'react'
import './det.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faDownload } from '@fortawesome/free-solid-svg-icons'
import { auth, db } from '../lib/firebase'
import { useUserStore } from '../lib/userStore'
import { useChatStore } from '../lib/useChatStore'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'

export default function Det() {

  const { user,isCurrentUserBlocked,isReceiverBlocked,changeBlock} = useChatStore();
  const {currentUser} = useUserStore() 
  const handleBlock = async () => {
    if (!user) return;
    
    const userDocRef = doc(db, "users", currentUser.id);
    try { 
      if (isReceiverBlocked) {
        await updateDoc(userDocRef, { blocked: arrayRemove(user.id) });
      } else {
        await updateDoc(userDocRef, { blocked: arrayUnion(user.id) });
      }
      changeBlock(); // Ensure this function correctly updates isReceiverBlocked
    } catch (err) {
      console.log("Error updating block status:", err);
    }
  };
  const handleLogout= (e)=>{
    e.preventDefault();
    auth.signOut();
  }
//   console.log(user?.uid)
  return (
    <div className='details'>
      <div className="user">
        <img src={user?.avatar || "/images/avatar.png"} alt="" />
        <h2>{user?.username || "Default Username"}</h2>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat settings</span>
            <FontAwesomeIcon icon={faChevronDown} />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & helps </span>
            <FontAwesomeIcon icon={faChevronDown} />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photo</span>
            <FontAwesomeIcon icon={faChevronUp} />
          </div>

          <div className="photos">
            <div className="photoItem">
              <div className="item_img">
              <img src="/images/sendimg.jpg" alt="sendimg" />
              <span>sendimg.jpg</span>
              </div>
              <FontAwesomeIcon icon={faDownload} />
            </div>
            <div className="photoItem">
              <div className="item_img">
              <img src="/images/sendimg.jpg" alt="sendimg" />
              <span>sendimg.jpg</span>
              </div>
              <FontAwesomeIcon icon={faDownload} />
            </div>
            <div className="photoItem">
              <div className="item_img">
              <img src="/images/sendimg.jpg" alt="sendimg" />
              <span>sendimg.jpg</span>
              </div>
              <FontAwesomeIcon icon={faDownload} />
            </div>
          </div>
          
        </div>
        <div className="option">
          <div className="title">
            <span>Shared files</span>
            <FontAwesomeIcon icon={faChevronDown} />
          </div>
        </div>
        {currentUser.id === user?.id ? "" :
        <button className="block_btn" onClick={handleBlock} >
            {
                 isCurrentUserBlocked ? "You are blocked!" : 
                 isReceiverBlocked ? "User blocked" : "Block user"
            }
        </button>}
        <button className="Logout_btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}
