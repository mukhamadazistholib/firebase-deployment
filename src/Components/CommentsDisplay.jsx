import { orderByChild, onValue, ref, update, get, query } from 'firebase/database'
import React, { useState, useEffect } from 'react'
import { database } from '../firebase-config'
import ScoreCounter from './ScoreCounter'
import { useAuth } from '../context/AuthContext'
import DeleteModal from './DeleteModal'
import AddReply from './AddReply'
import { v4 as uuidv4 } from 'uuid'
import ReplyDisplay from './ReplyDisplay'

function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    return (
      Math.floor(interval) +
      `${Math.floor(interval) === 1 ? ' year' : ' years'} ago`
    )
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return (
      Math.floor(interval) +
      `${Math.floor(interval) === 1 ? ' month' : ' months'} ago`
    )
  }
  interval = seconds / 86400
  if (interval > 1) {
    return (
      Math.floor(interval) +
      `${Math.floor(interval) === 1 ? ' day' : ' days'} ago`
    )
  }
  interval = seconds / 3600
  if (interval > 1) {
    return (
      Math.floor(interval) +
      `${Math.floor(interval) === 1 ? ' hour' : ' hours'} ago`
    )
  }
  interval = seconds / 60
  if (interval > 1) {
    return (
      Math.floor(interval) +
      `${Math.floor(interval) === 1 ? ' minute' : ' minutes'} ago`
    )
  }
  return (
    Math.floor(seconds) +
    `${Math.floor(seconds) === 1 ? ' second' : ' seconds'} ago`
  )
}

const CommentsDisplay = () => {
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [editComment, setEditComment] = useState('')
  const [editId, setEditId] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [delId, setDelId] = useState('')
  const [delModal, setDelModal] = useState(false)
  const [repId, setRepId] = useState('')
  const [isReply, setIsReply] = useState(false)
  const { currentUser, pending } = useAuth()

  const authenticate = () => new Promise((resolve) => setTimeout(resolve, 15000)) // 2 seconds

  useEffect(() => {
    authenticate().then(() => {
      const ele = document.getElementById('ipl-progress-indicator')
      if (ele) {
        // fade out
        ele.classList.add('available')
        setTimeout(() => {
          // remove from DOM
          ele.outerHTML = ''
        }, 15000)
      }
    })
  }, [])

  useEffect(() => {
    setCommentsLoading(true);
    onValue(ref(database), async (snapshot) => {
      setComments([]);
      const data = await snapshot.val();
      if (data) {
        const commentsArray = Object.values(data).map((comment) => {
          return comment; // Ensure a return value from the map callback
        });
        setComments(commentsArray); // Set comments directly without using spread
      }
      setCommentsLoading(false);
    });
  }, []);

  useEffect(() => {
    // Create a query to order by the timestamp field
    const commentsRef = ref(database, '/comments');
    const sortedCommentsQuery = query(commentsRef, orderByChild('createdAt'));
  
    // Retrieve the data with the sorted query
    get(sortedCommentsQuery).then((snapshot) => {
      if (snapshot.exists()) {
        const commentsArray = [];
        snapshot.forEach((childSnapshot) => {
          commentsArray.push(childSnapshot.val());
        });
        // Set commentsArray to state
        setComments(commentsArray);
      }
    });
  }, []);

  function handleEdit(comment) {
    if (comment.id === editId || editId === '') {
      setIsEdit((prev) => !prev)
    } else {
      setIsEdit(true)
    }
    setEditId(comment.id)
    setEditComment(comment.content)
    setIsReply(false)
    setRepId('')
  }

  function onUpdate() {
    update(ref(database, `/${editId}`), {
      content: editComment,
    })
    setIsEdit(false)
    setEditComment('')
    setEditId('')
  }

  function handleDelete(comment) {
    if (comment.id === delId || delId === '') {
      setDelModal((prev) => !prev)
    } else {
      setDelModal(true)
    }
    setDelId(comment.id)
  }

  function handleReply(comment) {
    if (comment.id === repId || repId === '') {
      setIsReply((prev) => !prev)
    } else {
      setIsReply(true)
    }
    setRepId(comment.id)
    setIsEdit(false)
    setEditId('')
    setEditComment('')
  }

  if (pending || commentsLoading)
    return (
      <img className='loader' src='../Assets/loader.gif' alt='loading...' />
    )

  if (comments.length === 0 && !pending)
    return <p className='no-comments'>No Comments Yet!</p>

  return (
    <div className='comments-container'>
      {comments.slice().reverse().map((comment) => {
        return (
          <React.Fragment key={comment.id}>
            <div className='comment'>
              <ScoreCounter
                key={uuidv4()}
                votes={comment.votes ? comment.votes : null}
                id={comment.id}
              />
              <div className='comment-content'>
                <div className='comment-top'>
                  <div className='left'>
                    {comment.user && comment.user.img ? (
                      <img
                        src={comment.user.img}
                        alt='profile'
                        className='comment-profile-img'
                      />
                    ) : (
                      <img
                        src='../Assets/profile-img.svg'
                        alt='profile'
                        className='comment-profile-img'
                      />
                    )}
                    <p className='username'>
                      {comment.user ? comment.user.username : 'Unknown'}
                      {currentUser && comment.user &&
                        comment.user.uid === currentUser.uid && (
                          <span className='current-user-badge'>you</span>
                        )}
                    </p>
                    <p className='comment-date'>
                      {timeSince(comment.createdAt)}
                    </p>
                  </div>
                  <div className='right'>
                    {currentUser && comment.user &&
                      comment.user.uid === currentUser.uid && (
                        <>
                          <p className='edit' onClick={() => handleEdit(comment)}>
                            <img src='../Assets/icon-edit.svg' alt='edit' />
                            Edit
                          </p>
                          <p
                            className='delete'
                            onClick={() => handleDelete(comment)}
                          >
                            <img src='../Assets/icon-delete.svg' alt='delete' />
                            Delete
                          </p>
                        </>
                      )}
                    <p className='reply' onClick={() => handleReply(comment)}>
                      <img src='../Assets/icon-reply.svg' alt='reply' />
                      Reply
                    </p>
                  </div>
                </div>

                {!(isEdit && comment.id === editId) && (
                  <div className='comment-text'>{comment.content}</div>
                )}

                {isEdit && comment.id === editId && (
                  <div className='update-comment'>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder='edit your comment'
                      style={{ resize: 'none' }}
                    />
                    <button
                      className={
                        editComment !== comment.content && editComment !== ''
                          ? ''
                          : 'update-disable'
                      }
                      disabled={editComment === comment.content}
                      onClick={onUpdate}
                    >
                      Update
                    </button>
                  </div>
                )}

                {delModal && comment.id === delId && (
                  <DeleteModal
                    key={uuidv4()}
                    comment={comment}
                    setDelId={setDelId}
                    setDelModal={setDelModal}
                  />
                )}
              </div>
            </div>
            {currentUser && isReply && comment.id === repId && (
              <AddReply
                key={uuidv4()}
                comment={comment}
                setRepId={setRepId}
                setIsReply={setIsReply}
              />
            )}
            {comment.replies && (
              <details open>
                <summary className='show-replies'>Show Replies</summary>

                <ReplyDisplay
                  comment={comment}
                  replies={comment.replies}
                  timeSince={timeSince}
                  key={uuidv4()}
                />
              </details>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CommentsDisplay;