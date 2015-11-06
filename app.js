'use strict'

require('babel-core/register')
const koa = require('koa')
const app = koa()
const router = require('koa-router')()
const MongoClient = require('mongodb').MongoClient
const thunky = require('thunky')
const mongo = require('./local').mongo
const Promise = require('bluebird')
// const redis = Promise.promisifyAll(require('redis').createClient())
const _ = require('lodash')
const stroke = require('chinese-stroke')
const fs = require('fs');

const React = require('react')
const ReactDom = require('react-dom/server')
const ejs = require('ejs')

const doggies = JSON.parse(fs.readFileSync('./doggies.json'))

const connect = thunky((done) => {
  const DB_URI = `mongodb://${mongo.user?(mongo.user+':'+mongo.pass + '@') : ''}${mongo.ip}:${mongo.port}/${mongo.db}`
  MongoClient.connect(DB_URI, done)
})


// logger

app.use(function *(next) {
  const start = new Date()
  yield next
  const ms = new Date() - start
  console.log('%s %s - %s ms', this.method, this.url, ms)
})

app.use(function *(next) {
  this.db = yield (done) => {
    connect(done)
  }
  yield next
})

router.get('/api/test',function* (){
  let name = this.query.name
  let arr = name.split('')
  let result = []
  arr.forEach(function(c, idx){
    result.push({
      char: c,
      stroke: (stroke.get(c) || 8)
    })
  })
  this.status = 200
  this.body = result
})

router.get('/api/single',function* (){
  let name = this.query.name
  let arr = name.split('')
  let result = 0;
  arr.forEach(function(c, idx){
    result += (stroke.get(c) || 8);
  })

 

  this.status = 200;
  this.body = {
    doggie: doggies[result%20],
    value: result%20,
  };
})

router.get('/api/articles', function*(){
   let articles =[ 
    {
      title:'你假装是我男朋友一下好吗',
      src: 'http://www.weibo.com/5729392133/D2jbyA7Pk?from=page_1005055729392133_profile&wvr=6&mod=weibotime&type=comment#_rnd1446697314887'
    },
    {title:'大四真的是老妹吗?',
      src: 'http://www.weibo.com/5729392133/D1GUf0rVX?from=page_1005055729392133_profile&wvr=6&mod=weibotime&type=comment#_rnd1446697322556'
    },
    {title:'为什麽女生总抱怨男生没时间陪',
      src: 'http://www.weibo.com/5729392133/D1ECgzf41?from=page_1005055729392133_profile&wvr=6&mod=weibotime&type=comment#_rnd1446697330939'
    },
    {title:'她最爱的颜色',
      src: 'http://www.weibo.com/5729392133/D1wLXdpKm?from=page_1005055729392133_profile&wvr=6&mod=weibotime&type=comment#_rnd1446697335251'
    }
  ]
  this.status = 200;
  this.body = articles;
})

router.get('/result', function*(){
  let data;
  if(this.query.name){
    let name = this.query.name
    let arr = name.split('')
    let result = 0;
    arr.forEach(function(c, idx){
      result += (stroke.get(c) || 8);
    })
    data = {
      doggie: doggies[result%20],
      value: result%20  
    };
  } else{
    data = {data: false};
  } 
  const template = fs.readFileSync(__dirname + '/views/index.html', 'utf-8')
  this.body = ejs.render(template, {data: data});
})

router.get('/', function*(){
  const template = fs.readFileSync(__dirname + '/views/index.html', 'utf-8')
  let data = {data: false};
  this.body = ejs.render(template, {data: data})
})

app.use(router.routes())
app.use(require('koa-static')(__dirname + '/static'))
// port
// 
app.listen(process.env.PORT || 3000, function(){
  console.log('Server start on Port: '+ (process.env.PORT || 3000));
})
