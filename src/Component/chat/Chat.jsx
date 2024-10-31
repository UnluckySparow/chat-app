import React, { useEffect, useRef, useState } from 'react';
import './chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faImage, faMicrophone, faPhone, faSmile, faVideo,faSignOut } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db,auth } from '../lib/firebase';
import { useChatStore } from '../lib/useChatStore';
import { useUserStore } from '../lib/userStore';
import upload from '../lib/upload';
export default function Chat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [img, setImg] = useState({
    file:null,
    url:''
  });
  const [chats, setChat] = useState([]);
  const { chatId, user,isCurrentUserBlocked,isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]); // Trigger scrolling whenever chats change

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unsub();
    };
  }, [chatId]);

  const handleImg = (e) =>{
    if(e.target.files[0]){
      setImg({
        file:e.target.files[0],
        url:URL.createObjectURL(e.target.files[0])
      });
    }
  }
  const handleSend = async () => {
    if (text === '') return;
    let imgUrl  = null
    try {
      if(img.file){
        imgUrl= await upload(img.file);
      }
      // Update the chat's messages with the new message
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && {img:imgUrl})
        }),
      });
  
      const userIDS = [currentUser.id, user.id];
  
      userIDS.forEach(async (id) => {
        const userChatsRef = doc(db, 'userchats', id); // Reference to each user's chat data
        const userChatsSnapshot = await getDoc(userChatsRef);
  
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          
          // Find the chat index
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          
          if (chatIndex !== -1) {
            // Clone the chats array and modify the specific chat item
            const updatedChats = [...userChatsData.chats];
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              lastMessage: text,
              isSeen: id === currentUser.id, // Set `isSeen` based on the user ID
              updatedAt: Date.now(),
            };
  
            // Update the document in Firestore with the modified array
            await updateDoc(userChatsRef, {
              chats: updatedChats,
            });
          }
        }
      });
  
      setText(''); // Clear the input after sending
    } catch (err) {
      console.log('Error sending message:', err.message);
    }
    setImg({
      file:null,
      url:''
    });
    setText('');
  };

  const handleSignout = (e) =>{
    e.preventDefault();
    auth.signOut();
  }

  return (
    <div className="chat">
      <div className="top">
       {isCurrentUserBlocked ? <img src={"/images/avatar.png"} alt="" /> : <img src={user?.avatar || "/images/avatar.png"} alt="" /> }
        <div className="texts">
          <span>{user?.username || 'Username'}</span>
          <p>Lorem Ipsum is simply dummy text. </p>
        </div>
        <div className="icons">
          <FontAwesomeIcon className="phone" icon={faPhone} />
          <FontAwesomeIcon className="video" icon={faVideo} />
          <FontAwesomeIcon className="info" icon={faSignOut} onClick={handleSignout}/>
        </div>
      </div>
      <div className="center">
        {chats?.messages?.map((message) => (
          <div className={`message ${message.senderId === currentUser.id ? 'own' : ''}`} key={message.createdAt?.toString()}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {/* <span>1min ago</span> */}
            </div>
          </div>
        ))}
        {img.url && <div className="message own">
          <div className="texts">
            <img src={img.url} alt='' />
          </div>
        </div>}
        {/* Scroll to this div */}
        <div ref={endRef} />
      </div>
      <div className="bottom">
        <div className="icon_bottom">
          <label htmlFor="file">
            <FontAwesomeIcon icon={faImage} disabled={isReceiverBlocked  || isCurrentUserBlocked }/>
          </label>
          <input type='file' id='file' style={{display:"none"}} onChange={handleImg} disabled={isReceiverBlocked  || isCurrentUserBlocked }/>
          <FontAwesomeIcon icon={faCamera} />
          <FontAwesomeIcon icon={faMicrophone} />
        </div>
        <div className="div_input">
          <input
            type="text"
            className="message"
            value={text}
            placeholder={isReceiverBlocked  || isCurrentUserBlocked ?"you cannot send" :"Your message here ..."}
            onChange={(e) => setText(e.target.value)}
            disabled={isReceiverBlocked  || isCurrentUserBlocked }
          />
          
        </div>
        
        <div className={`send_div  ${ isCurrentUserBlocked ? 'disabled-div' : isReceiverBlocked ? 'disabled-div' : ''}` }>
          <FontAwesomeIcon icon={faSmile} onClick={() => setOpen((prev) => !prev)} />
          <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          <button className="send_btn" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
