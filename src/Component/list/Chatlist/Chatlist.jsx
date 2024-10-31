import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './chatlist.css';
import { faMinus, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import Adduser from '../../adduser/Adduser';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/useChatStore';
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from '../../lib/firebase';

export default function Chatlist() {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser} = useUserStore();
  const { changeChat } = useChatStore();
  const [input, setInput] = useState('');
  const handleSelect = async (chat)=>{
    changeChat(chat.chatId,chat.user)
  }
  useEffect(() => {
    // Fetch chat data on user change
    const unsubscribe = onSnapshot(doc(db, "userchats", currentUser.id), async (snapshot) => {
      const chatItems = snapshot.data()?.chats || [];
      
      // Fetch user details for each chat item
      const chatData = await Promise.all(
        chatItems.map(async (item) => {
          const userDocRef = doc(db, 'users', item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        })
      );

      // Filter out duplicate chats based on receiverId
      const uniqueChats = Array.from(
        new Map(chatData.map(chat => [chat.receiverId, chat])).values()
      );

      // Sort chats by updatedAt timestamp
      setChats(uniqueChats.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [currentUser.id]);
  const filterSearch = chats.filter(
    (c) => c.user.username.toLowerCase().includes(input.toLocaleLowerCase())
  )
  return (
    <div className="chatlist">
      {/* Search and Add User Section */}
      <div className="search">
        <div className="inputsearch">
          <FontAwesomeIcon icon={faSearch} />
          <input type="text" placeholder="Search" className="input_search" onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <div className="icon_add">
          <FontAwesomeIcon 
            icon={addMode ? faMinus : faPlus} 
            className="add" 
            onClick={() => setAddMode(prev => !prev)} 
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="item_list">
        {filterSearch.map((chat) => (
          <div key={chat.chatId} className="item" onClick={()=>handleSelect(chat)}>
            {chat.user.blocked.includes(currentUser.id) 
              ? <img src={"/images/avatar.png"} alt="User Avatar" /> 
              : <img src={chat.user?.avatar || "/images/avatar.png"} alt="User Avatar" />
            }
            <div className="texts">
              <span>
                {
                  chat.user.blocked.includes(currentUser.id) ? "User" : 
                  chat.user?.username || "Unknown User"
                }
              </span>
              <p>{chat.lastMessage || "No messages yet"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Component */}
      {addMode && <Adduser />}
    </div>
  );
}
