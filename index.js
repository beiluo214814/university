const https = require('https')
const options = {
  hostname: 'szddgzh.szou.edu.cn',
  port: 443,
  path: '/edu-admin-api/score-search/student?pageNo=1&pageSize=40&studentNo=1844201452653',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cookie':'TS01bbbec7=015ffdac4280d5c16d08b02673264c2f5a502a71c26456ea137f245c262d030223944d32b1cac84db91a741241c2148b9e235ec246; JSESSIONID=F8E4DD192F10725B2C92DA36C2DBB5DE; a_securityContext=18ACA950AE4A23D2219A27A6DAEB3CA4'
  }
}

const req = https.request(options, res => {
  console.log(`状态码: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()