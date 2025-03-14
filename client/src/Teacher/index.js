import React from 'react'
import {useState,useEffect} from 'react'
import copy from 'copy-to-clipboard'
import { Button,message,Col, Divider, Row,Card  } from 'antd';
import * as moment from 'moment';
// import 'moment/locale/pt-br';
import './index.css';
import queryString from 'query-string';
import _ from 'lodash'

moment.locale('zh-cn');

const parsed = queryString.parse(window.location.search);
const teacherList = ['1101748424895442946','1108187562495180802','1787756854237859842','1101748425096769538']

const startDay = '20250217' //每学期开始日期

async function fetchData() {
  const promises = [];  // 声明 Promise 对象数组
  const teachers = parsed.teacherId?[parsed.teacherId]:teacherList;
  for (let i = 0,len=teachers.length; i < len; i++) {  // 循环遍历
    const promise = fetch(`/api/edu-admin-api/search/course-schedule?teacherId=${teachers[i]}`).then(
      response => response.json()
      ).then(json=>json.data);  // 请求接口并返回 Promise 对象
    promises.push(promise);  // 将 Promise 对象推入 Promise 对象数组
  }

  const result = await Promise.all(promises);  // 等待所有 Promise 对象的结果返回，并将结果合并为一个数组
  return result;
}

const courseTime ={
  '上午':'9：30—12：00',
  '下午':'14：30—17：00',
  '晚上':'19：00—21：30'
}

const weekData={
  '星期一':1,
  '星期二':2,
  '星期三':3,
  '星期四':4,
  '星期五':5,
  '星期六':6,
  '星期日':7
}

function getDiff(unit){
  // 假设我们有两个日期
var startDate = moment(startDay); // 开始日期
var endDate = moment();   // 结束日期，例如今天的日期
// 计算周数差异
var diff = endDate.diff(startDate, unit);
return diff
}

//判断是pc还是移动端
function isPC() {
  var userAgentInfo = navigator.userAgent;
  var mobileAgents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];

  // 检查是否任一移动设备标识符存在于用户代理字符串中
  var isMobile = mobileAgents.some(function(mobileAgent) {
      return userAgentInfo.indexOf(mobileAgent) > -1;
  });

  // 如果不是移动设备，则认为是 PC
  return !isMobile;
}

function App() {
  const [data, setData] = useState([]);
  const [dataIndex, setDataIndex] = useState({});
  const [dataClass,setDataClass] = useState({});
  const handleCopy=(data,todayInfo,dateInfo,currentTime,classNum)=>{
    let isOnline = false;
    if(currentTime ==1 || currentTime==classNum){
      isOnline = true
    }
    todayInfo.push(true)
    setDataIndex(_.cloneDeep(dataIndex))
    let todayDes = '今天'
    if(data.week == '星期六' || data.week == '星期日' ){
      todayDes = '本周末'
    }
    let dateDes = data.week
    copy(`${data.teacher}老师，您好！您${todayDes}（${dateDes}，${data.unit}，${dateInfo}，${courseTime[data.unit]}）有《${data.course}》课，${isOnline?'请携带摄像头，':''}上下课打卡签到签退，请提前至少10分钟到教室，收到请回复，谢谢[抱拳]！`)
    message.success('复制成功！')
  }

  const renderCardContent = (todayInfo,dateInfo)=>{
    return todayInfo && todayInfo.length && todayInfo.map((item,index)=>{
      const itemData = data[item[0]][item[1]];
     
      const weekClassName = itemData.className.trim()
      const weekTeacher = itemData.teacher.trim()
      const courseTrim = itemData.course.trim()
      const keyStr = `${weekClassName}+${weekTeacher}+${courseTrim}`
      const classNum = dataClass[keyStr].weekTime.length
      const week = dataClass[keyStr].week
      let classTime = '';
      let currentTime = 0;
      if(classNum){
        for(let i=0;i<classNum;i++){
          if(moment(startDay).add((dataClass[keyStr].weekTime[i]-1)*7+weekData[week]-1,'day').format('YYYY-MM-DD') === dateInfo){
            classTime = `${i+1}/${classNum}`
            currentTime = i+1
          }
        }
      }

      return <div>
        {itemData.course}({classTime})(<b>{itemData.teacher}</b>)({itemData.classroom})(<b>{itemData.className}</b>)<a target='_blank' href={itemData.liveClassroom}>进直播间</a>
        <Button type="link" style={{'color':item[2] ?'red':''}} onClick={()=>handleCopy(itemData,item,dateInfo,currentTime,classNum)}>复制通知</Button>
      </div>
    })
  }

  useEffect(() => {
      let ignore = false;
      // 调用 fetchData() 方法获取所有数据

      fetchData()
      .then(result => {
        if (ignore) {
          return
        }
        // 处理合并后的数据
        const tempObj = {}
        //将下标记录至日期上，便于渲染获取
        result.forEach((itemWrapper,indexWrapper)=>{
          itemWrapper.forEach((item,index)=>{
            if(!item.weekTime){
              return
            }
            const weekClassName = item.className.trim()
            const weekTeacher = item.teacher.trim()
            const courseTrim = item.course.trim()
            const keyStr = `${weekClassName}+${weekTeacher}+${courseTrim}`
            if(dataClass.hasOwnProperty(keyStr)){
              dataClass[keyStr].weekTime = dataClass[keyStr].weekTime.concat(item.weekTime.split(','))
              dataClass[keyStr].weekTime.sort((x,y)=>x-y)
            }else{
              const temp = {}
              temp['weekTime'] =  item.weekTime.split(',')
              temp['week'] =  item.week
              dataClass[keyStr] = temp
            }
            const weekArray = item.weekTime.split(',')
            weekArray.forEach(item1=>{
              const num =  (item1-1)*7 + weekData[item.week]
              if(tempObj[num]){
                tempObj[num].push([indexWrapper,index])
              }else{
                tempObj[num]=[[indexWrapper,index]]
              }
            })
          })
        })
        setDataClass(dataClass)
        setDataIndex(tempObj)
        setData(result)
      })
      .catch(error => {
        // 处理错误
        console.error(error);
      });
      return () => {
        ignore = true;
      };
  }, []);

  return (
    <div className="App">
      {isPC() ? <header className="App-header">
      {
        (()=>{
          let weekTotal = 1,
          tags = []
          while(weekTotal<21){
            if(weekTotal>getDiff('week'))
            tags.push( 
              [<Divider orientation="left">第{weekTotal}周</Divider>,
            <Row justify="space-between"  align="top" gutter={[16, 16]} className='App-row-wrapper'>
            {
              (()=>{
                let day = 1,
                item=[]
                while(day<8){
                  const todayInfo = dataIndex[(weekTotal-1)*7+day]
                  const dateInfo = moment(startDay).add((weekTotal-1)*7+day-1,'day').format('YYYY-MM-DD')
                    item.push(<Col span={3}>
                      <Card title={`${dateInfo}(周${day})`} bordered={false}>
                      {
                        renderCardContent(todayInfo,dateInfo)
                      }
                      </Card>
                    </Col>)
                  day++
                }
                return item
              })()
            }
          </Row>])
          weekTotal++;
          }
          return tags
        })()
      }
      </header>
      : <div>
        {
          (()=>{
            const item=[];
            let count=0;
            while(count<7){
              const dayIndex = getDiff('day')+1+count;
              const todayInfo = dataIndex[dayIndex];
              const momentObj = moment().add(count,'days')
              const dateInfo = momentObj.format('YYYY-MM-DD')
              item.push(<Card title={`${dateInfo}(${momentObj.format('dddd')})`} bordered={false}>
                      {
                        renderCardContent(todayInfo,dateInfo)
                      }
               </Card>)
              count++
            }
            return item
          })()
        }
      </div>
    }
    </div>
  );
}

export default App;
