const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const ses = new AWS.SES({apiVersion: '2010-12-01'})
const sendEmail = async (date) => {
    var params = {
      Destination: {
        CcAddresses: [
          process.env.FROM_ADDRESS
        ],
        ToAddresses: [
          process.env.TO_ADDRESS
        ]
      },
      Message: { 
        Body: { 
          Text: {
           Charset: "UTF-8",
           Data: process.env.SICK_EXCUSE
          }
         },
         Subject: {
          Charset: 'UTF-8',
          Data: process.env.SICK_SUBJECT
         }
        },
      Source: process.env.FROM_ADDRESS,
      ReplyToAddresses: [
         process.env.FROM_ADDRESS,
      ]
    };

    return new Promise((resolve, reject) => {
        ses.sendEmail(params).promise().then(() => {
            return resolve('done')
        }).catch((err) => {
            console.log(err)
            return reject('err')
        })
    })
}
const detect = async (params) => {
    return new Promise(async (resolve, reject) => {
        rekognition.detectText(params).promise()
        .then(data => {
            return resolve(data)
        }).catch(err => {
            console.log(err)
            return reject(err)
        })
    })
       
}
exports.handler = async (event) => {
let d = new Date()
let fileKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
const params = {
    Image: {
       S3Object: {
       Bucket: process.env.BUCKET_NAME, 
       Name: fileKey
      }
 }
}

let text = await detect(params)
let setAlarm = true
text.TextDetections.forEach((t, idx) => {
    if(t.DetectedText === '5') {
        console.log('Go back to sleep')
        setAlarm = false
    }
})

if(setAlarm) {
    console.log('WAKE UP!!!!!!')
    let done = await sendEmail(fileKey)
    return true
}
    
};
