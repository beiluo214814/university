import React from 'react'
import {useState,useEffect} from 'react'
import copy from 'copy-to-clipboard'
import { Button,message,Col, Divider, Row,Card  } from 'antd';
import * as moment from 'moment';
// import 'moment/locale/pt-br';
import './App.css';
import queryString from 'query-string';
import _ from 'lodash'

moment.locale('zh-cn');

const parsed = queryString.parse(window.location.search);
const major = {
  'computer':['234420000012509','234420000014517','234420000014518','234420000012015','234420000014021','234420000014020','224420000012031','224420000014031','224420000014032','224420000012006','224420000014008','224420000014007','244420000014030','244420000014031','244420000012023'],
 'civilengineering':['224420000014047','224420000012032','224420000014037','224420000014010','224420000014015','234420000014022','234420000012016','234420000014024','234420000014519','234420000012510','234420000014520','244420000014032','244420000012022'],
 'ecommerce':['224420000014033','224420000012039','234420000012017','234420000014023','234420000012511','234420000014516','224420000014012','20243442000001','244420000012021','244420000014029']
}

const startDay = '20240226' //每学期开始日期

async function fetchData() {
  const promises = [];  // 声明 Promise 对象数组
  const classes= parsed.classId ? [parsed.classId] : major[parsed.major];
  for (let i = 0,len=classes.length; i < len; i++) {  // 循环遍历
    const promise = fetch(`/api/course-schedule?classId=${classes[i]}`).then(
      response => response.json()
      ).then(json=>json.data);  // 请求接口并返回 Promise 对象
    promises.push(promise);  // 将 Promise 对象推入 Promise 对象数组
  }

  const result = await Promise.all(promises);  // 等待所有 Promise 对象的结果返回，并将结果合并为一个数组
  return result;
}

const courseTime ={
  '上午':'9：30—11：30',
  '下午':'14：30—16：30',
  '晚上':'19：00—21：00'
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

  const handleCopy=(data,todayInfo,isSame)=>{
    todayInfo.push(true)
    setDataIndex(_.cloneDeep(dataIndex))
    let dateDes = '今天'
    if(data.week == '星期六' || data.week == '星期日' ){
      dateDes = data.week
    }
    const classInfo = isSame?'':`${data.className.replace(/^\s+|\s+$/gm,'')}的`
    copy(`${classInfo}同学们：
    ${dateDes}${data.unit}有${data.teacher}老师的《${data.course}》课，
    时间：${courseTime[data.unit]}，
    线下地点：${data.classroom}，
    线上地址：${data.liveClassroom}。`)
    message.success('复制成功！')
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
  return (
    <div className="App">
      {isPC() ? <header className="App-header">
      {
        (()=>{
          let weekTotal = 1,
          tags = []
          while(weekTotal<22){
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
                      { todayInfo && todayInfo.length && todayInfo.map((item,index)=>{
                       const itemData = data[item[0]][item[1]];
                       let lastItemData = {},nextItemdata = {},lastSame = false,nextSame = false;
                       for(let i=0;i<index;i++){
                          lastItemData = data[todayInfo[i][0]][todayInfo[i][1]]
                          if(lastItemData.course == itemData.course && lastItemData.className.substr(0,3) == itemData.className.substr(0,3) && lastItemData.className.indexOf('专')!=-1 && itemData.className.indexOf('专')!=-1 && parsed.major=='computer'){
                            lastSame = true;
                          }
                        }
                        for(let i=index+1;i<todayInfo.length;i++){
                          nextItemdata = data[todayInfo[i][0]][todayInfo[i][1]]
                          if(nextItemdata.course == itemData.course && nextItemdata.className.substr(0,3) == itemData.className.substr(0,3) && nextItemdata.className.indexOf('专')!=-1 && itemData.className.indexOf('专')!=-1 && parsed.major=='computer'){
                            nextSame = true;
                          }
                        }
                       return !lastSame && <div>
                         {itemData.course}(<b style={{fontSize:'16px'}}>{itemData.className}</b>{nextSame && <span style={{color:'red'}}>合</span>})<a target='_blank' href={itemData.liveClassroom}>进直播间</a>
                         <Button type="link" style={{'color':item[2] ?'red':''}} onClick={()=>handleCopy(itemData,item,nextSame)}>复制通知</Button>
                       </div>
                     })}
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
                     { todayInfo && todayInfo.length && todayInfo.map((item,index)=>{
                       const itemData = data[item[0]][item[1]];
                       let lastItemData = {},nextItemdata = {},lastSame = false,nextSame = false;
                        for(let i=0;i<index;i++){
                          lastItemData = data[todayInfo[i][0]][todayInfo[i][1]]
                          if(lastItemData.course == itemData.course && lastItemData.className.substr(0,3) == itemData.className.substr(0,3) && lastItemData.className.indexOf('专')!=-1 && itemData.className.indexOf('专')!=-1 && parsed.major=='computer'){
                            lastSame = true;
                          }
                        }
                        for(let i=index+1;i<todayInfo.length;i++){
                          nextItemdata = data[todayInfo[i][0]][todayInfo[i][1]]
                          if(nextItemdata.course == itemData.course && nextItemdata.className.substr(0,3) == itemData.className.substr(0,3) && nextItemdata.className.indexOf('专')!=-1 && itemData.className.indexOf('专')!=-1 && parsed.major=='computer'){
                            nextSame = true;
                          }
                        }
                       
                       return !lastSame && <div>
                         {itemData.course}(<b style={{fontSize:'16px'}}>{itemData.className}</b>{nextSame && <span style={{color:'red'}}>合</span>})<a target='_blank' href={itemData.liveClassroom}>进直播间</a>
                         <Button type="link" style={{'color':item[2] ?'red':''}} onClick={()=>handleCopy(itemData,item,nextSame)}>复制通知</Button>
                       </div>
                     })}
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
