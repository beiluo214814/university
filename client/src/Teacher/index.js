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
const teacherList = ['1829524782645686273','1101748426086625281','1829346901802004481','1101745422121906177','1186452271354396674','1101748425381982210','1374533736726437890','1432519544603131906','1432520790722461697','1101748069680562178','1614589770864762882','1199154424413241345','1101748424895442946','1101748425147101186','1101748425096769538']

const startDay = '20240902' //每学期开始日期

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
  const handleCopy=(data,todayInfo)=>{
    todayInfo.push(true)
    setDataIndex(_.cloneDeep(dataIndex))
    let dateDes = data.week
    const classInfo = `${data.className.replace(/^\s+|\s+$/gm,'')}的`
    copy(`${data.teacher}老师，您好：
    ${dateDes}${data.unit}(${courseTime[data.unit]})有《${data.course}》课，
    上下课打卡签到签退，收到请回复，谢谢[抱拳]！`)
    message.success('复制成功！')
  }

  const renderCardContent = (todayInfo)=>{
    return todayInfo && todayInfo.length && todayInfo.map((item,index)=>{
      const itemData = data[item[0]][item[1]];
     
      return <div>
        {itemData.course}(<b>{itemData.teacher}</b>)(<b>{itemData.className}</b>)<a target='_blank' href={itemData.liveClassroom}>进直播间</a>
        <Button type="link" style={{'color':item[2] ?'red':''}} onClick={()=>handleCopy(itemData,item)}>复制通知</Button>
      </div>
    })
  }

  useEffect(() => {
      // 调用 fetchData() 方法获取所有数据
      fetchData()
      .then(result => {
        // 处理合并后的数据
        const weekData={
          '星期一':1,
          '星期二':2,
          '星期三':3,
          '星期四':4,
          '星期五':5,
          '星期六':6,
          '星期日':7
        }
        const tempObj = {}
        //将下标记录至日期上，便于渲染获取
        result.forEach((itemWrapper,indexWrapper)=>{
          itemWrapper.forEach((item,index)=>{
            if(!item.weekTime){
              return
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
        setDataIndex(tempObj)
        setData(result)
      })
      .catch(error => {
        // 处理错误
        console.error(error);
      });
  }, []);

console.log(222,dataIndex)
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
                    item.push(<Col span={3}>
                      <Card title={`${moment(startDay).add((weekTotal-1)*7+day-1,'day').format('YYYY-MM-DD')}(周${day})`} bordered={false}>
                      {
                        renderCardContent(todayInfo,data)
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
              item.push(<Card title={`${momentObj.format('YYYY-MM-DD')}(${momentObj.format('dddd')})`} bordered={false}>
                      {
                        renderCardContent(todayInfo,data)
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
