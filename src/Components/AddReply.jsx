import { ref, update } from 'firebase/database'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { database } from '../firebase-config'
import { v4 as uuidv4 } from 'uuid'

const AddReply = ({
  comment,
  setIsReply,
  replyOBJ,
  setReplyAdded, // Ensure this prop is correctly passed as a function
}) => {
  const { currentUser } = useAuth()
  const [reply, setReply] = useState('')

  function handleReply() {
    if (reply !== '') {
      const id = uuidv4()
      const replyData = {
        id: id,
        content: reply,
        createdAt: Date.now(),
        user: {
          uid: currentUser.uid,
          img: currentUser.photoURL,
          username: currentUser.displayName
            .replace(/[^A-Za-z]/g, '')
            .toLowerCase(),
        },
        replyTo: replyOBJ ? replyOBJ.user.username : comment.user.username,
      };
      const replyRef = ref(database, `/${comment.id}`);
      
      update(replyRef, {
        replies: {
          ...(comment.replies || {}),
          [id]: replyData,
        },
      }).then(() => {
        setIsReply(false);
        if (typeof setReplyAdded === 'function') {
          setReplyAdded(true);
        }
      }).catch((error) => {
        // Handle error if needed
        console.error('Error adding reply:', error);
      });
    }
  }

  return (
    <div className='add-reply'>
      <div className='textarea-wrapper'>
        <p className='replying-to'>
          Replying to <span>{comment.user.username}</span>
        </p>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder='add a reply'
          style={{ resize: 'none' }}
        />
      </div>
      <div className='comment-btn-wrapper'>
        <button onClick={handleReply}>Reply</button>
      </div>
    </div>
  )
}

export default AddReply
