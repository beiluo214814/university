var https = require('https');
let co = require('co');//异步控制器

// https://szddgzh.szou.edu.cn/edu-admin-api/search/course-schedule?classId=234420000012509


/**获取列表 */
let getCustomerList = async (ctx, next) => {
    let request = ctx.request;
    // let req_body = request.body;//从请求body中获取参数
    let req_query = request.query;
    // let postdata = JSON.stringify(req_body);//转换成字符串
    var content = '';
    var body_request = {
        hostname: 'szddgzh.szou.edu.cn',
        path: "/edu-admin-api/search/course-schedule?classId=" + req_query.classId,
        port: 443,
        method: "get",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8"
            // 'Content-Length': postdata && postdata.length//填写数据长度
        }
    };

	/***请求第三方接口***/
    function sendHttpRequest() {
    	/*****创建promise函数****/
        return new Promise(function (resolve, reject) {
        	/*****正常的发请求****/
            var req = https.request(body_request, (res) => {
				/*****设置编码****/
                res.setEncoding('utf-8');
                /*****合并返回数据****/
                res.on('data', (chunk) => {
                    content += chunk;
                });
                /*****数据获取完成后 resolve提交****/
                res.on('end', () => {
                    resolve({ ...JSON.parse(content) });
                });
            })
			/*****发送请求体*****/
            // req.write(postdata);
			/*****异常处理*****/
            req.on('error', function (err) {
                resolve({ result: false, errmsg: err.message });
            });
			/*****结束请求*****/
            req.end();
        });
    }

    let res = await co(function* () {//使用生成器函数并且掉用请求 res保存返回内容
        let req_res = yield sendHttpRequest();
        /**********/
        //todo
        /**********/
        return req_res
    });
	/*****把接口返回的数据发送给前端*****/
    ctx.body = res 
}

/**获取列表 */
let getClassListByTeacher = async (ctx, next) => {
    let request = ctx.request;
    // let req_body = request.body;//从请求body中获取参数
    let req_query = request.query;
    // let postdata = JSON.stringify(req_body);//转换成字符串
    var content = '';
    var body_request = {
        hostname: 'szddgzh.szou.edu.cn',
        path: "/edu-admin-api/search/course-schedule?teacherId=" + req_query.teacherId,
        port: 443,
        method: "get",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8"
            // 'Content-Length': postdata && postdata.length//填写数据长度
        }
    };

	/***请求第三方接口***/
    function sendHttpRequest() {
    	/*****创建promise函数****/
        return new Promise(function (resolve, reject) {
        	/*****正常的发请求****/
            var req = https.request(body_request, (res) => {
				/*****设置编码****/
                res.setEncoding('utf-8');
                /*****合并返回数据****/
                res.on('data', (chunk) => {
                    content += chunk;
                });
                /*****数据获取完成后 resolve提交****/
                res.on('end', () => {
                    try {
                        if(content.indexOf('html'))
                            resolve({})
                        else{
                            const jsonContent = JSON.parse(content)
                            resolve({ ...jsonContent });
                        }
                    } catch (error) {
                        console.log(error)
                    }
                   
                });
            })
			/*****发送请求体*****/
            // req.write(postdata);
			/*****异常处理*****/
            req.on('error', function (err) {
                resolve({ result: false, errmsg: err.message });
            });
			/*****结束请求*****/
            req.end();
        });
    }

    let res = await co(function* () {//使用生成器函数并且掉用请求 res保存返回内容
        let req_res = yield sendHttpRequest();
        /**********/
        //todo
        /**********/
        return req_res
    });
	/*****把接口返回的数据发送给前端*****/
    ctx.body = res 
}

module.exports = { getCustomerList, getClassListByTeacher }
