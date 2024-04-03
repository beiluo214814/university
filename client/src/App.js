import React from 'react'
import {useState,useEffect} from 'react'
import copy from 'copy-to-clipboard'
import { Button,message } from 'antd';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import './App.css';
import queryString from 'query-string';
import { Col, Divider, Row,Card } from 'antd';

const parsed = queryString.parse(window.location.search);
const major = {
  'computer':['234420000012509','234420000014517','234420000014518','234420000012015','234420000014021','234420000014020','224420000012031','224420000014031','224420000014032','224420000012006','224420000014008','224420000014007'],
 'civilengineering':['224420000012016','224420000012032','234420000012016','234420000012510','224420000014010','224420000014047','234420000014022','234420000014519','224420000014015','224420000014037','234420000014024','234420000014024'],
 'ecommerce':[]
}
async function fetchData() {
  const promises = [];  // 声明 Promise 对象数组
  const classes=major[parsed.major];
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
const handleCopy=(data)=>{
  copy(`${data.className.replace(/^\s+|\s+$/gm,'')}的同学们：
  今天${data.unit}有${data.teacher}老师的《${data.course}》课，
  时间：${courseTime[data.unit]}，
  线下地点：${data.classroom}，
  线上地址：${data.liveClassroom}。`)
  message.success('复制成功！')
}

function App() {

  const [data, setData] = useState([]);
  const [dataIndex, setDataIndex] = useState({});

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
      <header className="App-header">
      {
        (()=>{
          let weekTotal = 1,
          tags = []
          while(weekTotal<22){
            tags.push( 
              [<Divider orientation="left">第{weekTotal}周</Divider>,
            <Row justify="space-between" align="top" gutter={[16, 16]} className='App-row-wrapper'>
            {
              (()=>{
                let day = 1,
                item=[]
                while(day<8){
                  // if(day!=6 && day!=7)
                    item.push(<Col span={3}>
                      <Card title={`${moment('20240226').add((weekTotal-1)*7+day-1,'day').format('YYYY-MM-DD')}(周${day})`} bordered={false}>
                      { dataIndex[(weekTotal-1)*7+day] && dataIndex[(weekTotal-1)*7+day].length && dataIndex[(weekTotal-1)*7+day].map((item)=>{
                        const itemData = data[item[0]][item[1]]
                        return <div>
                          {itemData.course}({itemData.className})<a target='_blank' href={itemData.liveClassroom}>进直播间</a>
                          <Button type="link" onClick={()=>handleCopy(itemData)}>复制通知</Button>
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
    </div>
  );
}

export default App;
