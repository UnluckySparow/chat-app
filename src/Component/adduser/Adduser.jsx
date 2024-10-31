import { faAdd, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import './Adduser.css'
import { toast } from 'react-toastify'
import { db } from '../lib/firebase';
import { arrayUnion, collection,doc,getDocs,query,serverTimestamp,setDoc,updateDoc,where } from 'firebase/firestore'
import { useUserStore } from '../lib/userStore'
export default function Adduser() {
    const [user, setUser] = useState(null)
    const  {currentUser} = useUserStore()
    const handleSearch = async (e) =>{
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username')
        try { 
            const userRef = collection(db,"users")
            const q = query(userRef,where("username" , '==' , username))
            const querySnapShot = await getDocs(q)
            if(!querySnapShot.empty){
                setUser(querySnapShot.docs[0].data());
            }
            
        }
        catch(err){
            toast.error(err.message);
        }

    }
    const handleAdd = async ()=>{
        const  chatRef = collection(db,'chats')
        const  userChatsRef = collection(db,'userchats')
        try{
            const newChatRef = doc(chatRef)
            await setDoc(newChatRef,{
                createdAt:serverTimestamp(),
                message:[]
            })
            
            await updateDoc(doc(userChatsRef,user.id),{
                chats:arrayUnion({
                    chatId:newChatRef.id,
                    lastMessage:"",
                    receiverId:currentUser.id,
                    updatedAt:Date.now(),
                })
            })

            await updateDoc(doc(userChatsRef,currentUser.id),{
                chats:arrayUnion({
                    chatId:newChatRef.id,
                    lastMessage:"",
                    receiverId:user.id,
                    updatedAt:Date.now(),
                })
            })

        }
        catch(err){
            toast.message(err.message)
        }
    }
  return (
    <div className='adduser_div'>
        <form onSubmit={handleSearch}>
            <input type='text' placeholder='Username' name='username' />
            <button className='search_adduser'>
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </form>
        <div className='users'>
           {user &&  <div className="user">
                <div className="details_div">
                    <img src={user.avatar || "/images/avatar.png"} alt="user_avatar" />
                    <span>{user.username}</span>
                </div>
                <button className='btn_adduser' onClick={handleAdd}>
                    <FontAwesomeIcon icon={faAdd} />
                </button>
            </div>}
        </div>
    </div>
  )
}
