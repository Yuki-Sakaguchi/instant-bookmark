# Instant Bookmark
みんなに共有するための使い捨て用のブックマークが５秒で作れるサービスです。

# deploy
## hosting
https://instans-bookmark.firebaseapp.com/
```
npm run build
firebase serve
firebase deploy
```

## function
https://us-central1-instans-bookmark.cloudfunctions.net/getOgp?url=[url]
```
firebase deploy --only functions:getOgp
```
