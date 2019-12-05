[![Netlify Status](https://api.netlify.com/api/v1/badges/b28ea42f-298b-478b-b0bb-5f119535fed3/deploy-status)](https://app.netlify.com/sites/squaremill/deploys)

# squaremill.com
Static html version of squaremill.com
```
cd <project directory>
gem install jekyll
npm install
gulp build (first build only)
gulp
http://localhost:4000
```

## Deploy to Netlify
```
git push origin master
```

## Build fails on Jekyll task
Sometimes a watch/build fails during a Jekyll task. When that happens, run a jekyll command to see the error eg:
```
jekyll serve
```

## Branch deploys
```
git push origin branch-name
https://branch-name--squaremill.netlify.com
```
