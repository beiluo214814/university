const Koa = require('koa');
const Router=require('koa-router');
const app = new Koa();
const router=new Router();
const jszwyApiService = require('./service');
var ip = require('ip');
var myip = ip.address(); 
 
router.get('/api/course-schedule', async function (ctx, next) {
  await jszwyApiService.getCustomerList(ctx, next)
})

router.get('/api/edu-admin-api/search/course-schedule', async function (ctx, next) {
  await jszwyApiService.getClassListByTeacher(ctx, next)
})


router.get(/^(?!\/api\/).*/,async ctx=>{
  ctx.body=`
  <html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="">
  </head>
  <body>
  <div id="root"></div>
  <script defer src="http://${process.argv,process.argv[2] == '118.195.233.117'?'118.195.233.117':myip}:5000/static/js/bundle.js"></script>
  </body>
</html>
  `;
})

app.use(router.routes()).use(router.allowedMethods());

const port=process.env.PORT || 3001;

app.listen(port,()=>{
    console.log(`server started on ${port}`)
})