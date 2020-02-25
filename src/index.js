import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import styled from 'styled-components'

import uuid from 'uuid/v4'
import axios from 'axios'

// Firebaseの設定
import firebase from 'firebase/app'
import firebaseConfig from './firebase/Config'
import 'firebase/firestore'
firebase.initializeApp(firebaseConfig);

const apiUrl = 'https://us-central1-instans-bookmark.cloudfunctions.net/getOgp'

const StyledLink = styled(Link)`
  margin: 20px;
`
const StyledSection = styled.section`
  margin: 30px 0;
`

const Droparea = styled.p`
  text-align: center;
  padding: 50px;
  border: 3px dashed gray;
  background-color: lightgray;
  color: gray;
`

const StyledAnc = styled.a`
  display: inline-block;
  margin: 10px 0;
  width: 300px;

  img {
    width: 100%;
  }
`

const App = (props) => {
  return (
    <>
      <h1>Instant Bookmark</h1>
      <BrowserRouter>
        <StyledLink to="/">Home</StyledLink>
        <StyledLink to="/edit">edit</StyledLink>
        <StyledLink to="/bookmark/11111111111111">test bookmark</StyledLink>
        <StyledLink to="/archive">archive</StyledLink>
        <StyledSection>
          <Route exact path="/" component={Home}/>
          <Route path="/edit" component={Edit}/>
          <Route path="/bookmark/:id" component={Bookmark}/>
          <Route path="/archive" component={Archive}/>
        </StyledSection>
      </BrowserRouter>
    </>
  )
}

const Home = (props) => {
  return <div>みんなに共有するための使い捨て用のブックマークが５秒で作れるサービスです。</div>
}

const Edit = (props) => {
  const [title, setTitle] = useState('')
  const [input, setInput] = useState('');
  const [resultUrl, setResultUrl] = useState('')
  const [list, setList] = useState([]);

  const dragoverHandler = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  const dropHandler = (event) => {
    event.preventDefault();
    var data = event.dataTransfer.getData("text/plain");

    let exist = list.some((val, idx) => {
      console.log(val)
      return val.url === data
    })

    if (!exist) {
      axios.get(apiUrl, { params: {url: data}}).then(req => {
        console.log(req.data)
        setList([...list, {
          url: data,
          meta: {...req.data}
        }])
        setInput('')
        setTitle('')
      }).catch((err) => {
        console.log(err)
      })
    }
  }

  const addList = (event) => {
    event.preventDefault();
    let exist = list.some((val, idx) => val.url === input)
    if (!exist) {
      axios.get(apiUrl, { params: {url: input}}).then(req => {
        console.log(req.data)
        setList([...list, {
          url: input,
          meta: {...req.data}
        }])
        setInput('')
        setTitle('')
      }).catch((err) => {
        console.log(err)
      })
    }
  }

  const createBookmark = () => {
    if (window.confirm('作成します。本当によろしいでしょうか？')) {
      const uid = uuid();
      const db = firebase.firestore()
      db.collection('bookmark').doc(uid).set({
        title: title,
        items: [...list]
      })
      alert(`success!!`)
      setResultUrl(`https://instans-bookmark.firebaseapp.com/bookmark/${uid}`)
    }
  }

  return (
    <>
      <h2>Edit</h2>
      <form onSubmit={(e) => addList(e)}>
        <input onChange={(e) => setInput(e.target.value)} value={input}/>
        <button onClick={(e) => addList(e)} type="submit">追加</button>
      </form>
      <input onChange={(e) => setTitle(e.target.value)} value={title} placeholder="タイトル"/>
      <Droparea onDrop={(event) => dropHandler(event)} onDragOver={(event) => dragoverHandler(event)}>Drop Zone</Droparea>
      {list.map((item, index) => 
        <StyledAnc key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">
          {item.meta['og:image'] ? <img src={item.meta['og:image']} alt=""/> : ''}
          <p>{item.url}</p>
        </StyledAnc>
      )}
      <div>
        <button onClick={(e) => createBookmark(e)}>作成</button>
      </div>
      {resultUrl ? <div>こちらのURLからアクセスできます：　<a href={resultUrl} target="_blank" rel="noopener noreferrer">{resultUrl}</a></div> : ''}
    </>
  )
}

const Bookmark = (props) => {
  const [data, setData] = useState({})
  const db = firebase.firestore()
  const { id } = props.match.params

  console.log(id, data)

  useEffect(() => {
    (async () => {
      const res = await db.collection('bookmark').doc(id).get()
      if (res.data()) {
        setData(res.data())
      }
    })()
  }, [db, id])

  return (
    <>
      <h2>bookmark id:{id}</h2>
      {Object.keys(data).length > 0
        ? (
            <div>
              <h3>{data.title}</h3>
              <div>
                {data.items.map((item, index) => 
                  <StyledAnc key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.meta['og:image'] ? <img src={item.meta['og:image']} alt=""/> : ''}
                    <p>{item.url}</p>
                  </StyledAnc>
                )}
              </div>
            </div>
        ) : <div>リストが取得できませんでした</div>
      }
    </>
  )
}


const Archive = (props) => {
  const [data, setData] = useState([])
  const db = firebase.firestore()

  useEffect(() => {
    (async () => {
      const res = await db.collection('bookmark').get()
      
      if (res.docs.length > 0) {
        setData([
          ...res.docs
        ])
      }
    })()
  }, [db])

  console.log(data)

  return (
    <>
      <h2>Archive</h2>
      {Object.keys(data).length > 0
        ? (
            <div>
              {data.map((item, index) => 
                <StyledLink to={`/bookmark/${item.id}`} key={item.id}>
                  <p>{item.id}</p>
                </StyledLink>
              )}
            </div>
        ) : <div>リストが取得できませんでした</div>
      }
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
