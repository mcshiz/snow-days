const request = require('request-promise')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const load = async (options, key) => {
    return new Promise(async (resolve, reject) => {
        const body = await request(options)
        await s3.upload({
            Bucket: process.env.BUCKET_NAME,
            Key   : key,
            Body  : body,   
          }).promise()
          .then(() => {
              console.log('uploaded')
              return resolve(true)
          }).catch(err => {
              console.log('err', err)
              return reject(false)
          })
    })
}

  
exports.handler = async (event) => {
    let d = new Date()
    let fileKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.jpg`
    const options = {
        uri: process.env.IMAGE_URL,
        encoding: null
    };
    
    let result = await load(options, fileKey)
    return result
 
};

