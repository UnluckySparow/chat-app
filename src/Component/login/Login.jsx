import React, { useState } from 'react'
import './login.css';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'firebase/auth';
import { auth,db } from '../lib/firebase';
import {doc,setDoc} from 'firebase/firestore'
import upload from '../lib/upload';

export default function Login() {
    const [div_show,setDiv_show]=useState(true);
    const [avatar,setAvatar]=useState({
        file:null,
        url:''
    })
    const [loading,setLoading]=useState(false)
    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file); // Generate a URL for the image preview

            setAvatar({
                file: file,
                url: url
            });
        }
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData(e.target);
        const{email,password} = Object.fromEntries(formData)

        try{
         await signInWithEmailAndPassword(auth,email,password)
        //  onSignIn();
         toast.success('connected');

        }catch(err){
            console.log(err)
            toast.error(err.message)
        }finally{
            setLoading(false);
        }   
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const{username,email,password} = Object.fromEntries(formData);

        setLoading(true)
        try{
            const res = await createUserWithEmailAndPassword(auth,email,password)
            const imgUrl = await upload(avatar.file)
            await setDoc(doc(db,'users',res.user.uid),{
                username,
                email,
                avatar:imgUrl,
                id:res.user.uid,
                blocked:[],
            })
            await setDoc(doc(db,'userchats',res.user.uid),{
                chats:[],
            })
            toast.success('Account created ! you can login now');
        }
        catch(err){
            console.log(err);
            toast.error(err.message);
        }
        finally{
            setLoading(false)
        }
    }

  return (
    <div className='div_login'>
        {div_show ? (
            <>
            <div className="div_signin">
            <h2>Welcome !</h2>
            <form  onSubmit={handleLogin}>
                <input type="email" placeholder='Your Mail' name='email'/>
                <input type="password" placeholder='Your Password' name='password'/>
                <div className="grp_btn">
                    <button className="btn_signin" disabled={loading}>Sign In</button>
                    <button className="btn_createaccount" onClick={(e)=>{e.preventDefault();setDiv_show(false)}}>Sign up</button>
                </div>
                
            </form>
        </div>
        </>) : (
            <div className="div_createaccount">
                <h2> Create your account</h2>
                <form onSubmit={handleRegister}>
                    <div className="img_log">
                    <img src={avatar.url || '/images/avatar.png'} alt="imageperso" />
                    <label htmlFor='file'>Upload your image</label>
                    </div>
                    <input type="file" name="file" id="file" style={{display:"none"}} onChange={handleAvatar}/>
                    <input type="text" placeholder='Username' name='username'/>
                    <input type="email" placeholder='Your Mail' name='email'/>
                    <input type="password" placeholder='Your Password' name='password'/>
                    <div className="grp_btn">
                        <button className="btn_createaccount" disabled={loading}>{loading ? "Loading ...": "Sign up"}</button>
                        <button className="btn_signin" onClick={(e)=>{e.preventDefault();setDiv_show(true)}}>Sign In</button>
                    </div>
            </form>
            </div>
        )}
    </div>
  )
}
