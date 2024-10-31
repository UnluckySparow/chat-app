import React from 'react'
import Userinfo from './Userinfo/Userinfo'
import Chatlist from './Chatlist/Chatlist'
import './list.css'

export default function list() {
  return (
    <div className='list'>
         <Userinfo />
        <Chatlist />
    </div>
  )
}
